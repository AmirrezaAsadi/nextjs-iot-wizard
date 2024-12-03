import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Device, Person, Rule, SystemEvent, Location } from "../types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EventsManagerProps {
  devices: Device[];
  people: Person[];
  rules: Rule[];
  locations: Location[];
  apiKey: string;
  onUpdateDevices?: (devices: Device[]) => void;
}

type Season = 'winter' | 'spring' | 'summer' | 'autumn';
type TimeOfDay = 'night' | 'morning' | 'afternoon' | 'evening';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface APIEvent {
  timestamp: string;
  deviceName: string;
  location: string;
  event: string;
  value?: number | string | boolean;
}

interface TemperatureRange {
  day: [number, number];
  night: [number, number];
}

interface EnvironmentalContext {
  isDaytime: boolean;
  season: Season;
  timeOfDay: TimeOfDay;
  baseTemperature: Record<Season, TemperatureRange>;
}

interface LocationStory {
  environmental: string;
  activities: string;
  deviceStatus: string;
}

interface StoryState {
  overview: string;
  locationStories: Record<string, LocationStory>;
}

function getEnvironmentalContext(): EnvironmentalContext {
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  
  const seasonMap: Season[] = [
    'winter', 'winter',
    'spring', 'spring',
    'summer', 'summer',
    'autumn', 'autumn', 'autumn',
    'winter', 'winter', 'winter'
  ];
  
  return {
    isDaytime: hour >= 6 && hour <= 18,
    season: seasonMap[month],
    timeOfDay: hour < 6 ? 'night' : 
               hour < 12 ? 'morning' : 
               hour < 18 ? 'afternoon' : 'evening',
    baseTemperature: {
      winter: { day: [-5, 10], night: [-15, 0] },
      spring: { day: [10, 20], night: [0, 10] },
      summer: { day: [20, 35], night: [15, 25] },
      autumn: { day: [5, 20], night: [0, 10] }
    }
  };
}

async function makeRequest(apiKey: string, messages: ChatMessage[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateLocationStory(
  location: Location,
  devices: Device[],
  people: Person[],
  rules: Rule[],
  context: EnvironmentalContext,
  apiKey: string
): Promise<LocationStory> {
  const [environmental, activities, deviceStatus] = await Promise.all([
    makeRequest(apiKey, [{
      role: "system",
      content: `Generate a brief environmental description for ${location.name} (${location.type}):
        - Current time: ${context.timeOfDay}
        - Season: ${context.season}
        - Weather and lighting conditions
        Respond with 2-3 sentences only.`
    }]),
    makeRequest(apiKey, [{
      role: "system",
      content: `Describe current activities in ${location.name}:
        People: ${people.map(p => `${p.name} (${p.keyActivities.join(', ')})`).join(', ')}
        Goals: ${people.map(p => p.goals.join(', ')).join('; ')}
        Time: ${context.timeOfDay}
        Respond with 2-3 sentences only.`
    }]),
    makeRequest(apiKey, [{
      role: "system",
      content: `Describe device states in ${location.name}:
        Devices: ${devices.map(d => 
          `${d.name} (${d.type}, ${d.features.join(', ')})`
        ).join(', ')}
        Rules: ${rules.filter(r => r.isActive).map(r => r.description).join(', ')}
        Respond with 2-3 sentences only.`
    }])
  ]);

  return {
    environmental,
    activities,
    deviceStatus
  };
}

async function generateSystemStories(
  devices: Device[],
  people: Person[],
  rules: Rule[],
  locations: Location[],
  apiKey: string
): Promise<StoryState> {
  const context = getEnvironmentalContext();
  
  // Group devices and people by location
  const devicesByLocation = devices.reduce((acc, device) => {
    const location = device.location || 'unspecified';
    if (!acc[location]) acc[location] = [];
    acc[location].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  const peopleByLocation = people.reduce((acc, person) => {
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]?.name || 'unspecified';
    if (!acc[randomLocation]) acc[randomLocation] = [];
    acc[randomLocation].push(person);
    return acc;
  }, {} as Record<string, Person[]>);

  // Generate system overview
  const overview = await makeRequest(apiKey, [{
    role: "system",
    content: `Provide a brief system overview:
      Time: ${new Date().toISOString()}
      Season: ${context.season}
      Time of day: ${context.timeOfDay}
      Locations: ${locations.map(l => l.name).join(', ')}
      Rules: ${rules.filter(r => r.isActive).map(r => r.description).join(', ')}
      Respond with 2-3 sentences only.`
  }]);

  // Generate stories for each location
  const locationStories: Record<string, LocationStory> = {};
  for (const location of locations) {
    locationStories[location.name] = await generateLocationStory(
      location,
      devicesByLocation[location.name] || [],
      peopleByLocation[location.name] || [],
      rules,
      context,
      apiKey
    );
  }

  return { overview, locationStories };
}

async function generateEvents(
  devices: Device[],
  stories: StoryState,
  apiKey: string
): Promise<SystemEvent[]> {
  const content = await makeRequest(apiKey, [{
    role: "system",
    content: `Generate the next minute of events based on:
      ${stories.overview}
      
      ${Object.entries(stories.locationStories).map(([loc, story]) => `
        ${loc}:
        ${story.environmental}
        ${story.activities}
        ${story.deviceStatus}
      `).join('\n')}
      
      Return a JSON array of events with:
      - timestamp: ISO string
      - deviceName: Must match exactly: ${devices.map(d => d.name).join(', ')}
      - location: string
      - event: string
      - value: optional, matching device type`
  }]);

  const parsedEvents = JSON.parse(content) as APIEvent[];
  return parsedEvents.map((event) => ({
    ...event,
    timestamp: new Date(event.timestamp)
  }));
}
export function EventsManager({ 
  devices, 
  people, 
  rules, 
  locations, 
  apiKey,
  onUpdateDevices 
}: EventsManagerProps) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryState | null>(null);

  const updateSystem = useCallback(async () => {
    if (!apiKey) {
      setError("Please enter an API key");
      return;
    }

    try {
      // Generate stories first
      const newStories = await generateSystemStories(devices, people, rules, locations, apiKey);
      setStories(newStories);

      // Generate events based on stories
      const newEvents = await generateEvents(devices, newStories, apiKey);
      
      // Update events list
      const updatedEvents = [...events, ...newEvents]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(-50);

      setEvents(updatedEvents);

      // Update device states
      if (onUpdateDevices) {
        const updatedDevices = devices.map(device => {
          const relevantEvent = newEvents.find(e => e.deviceName === device.name);
          if (relevantEvent?.value !== undefined) {
            return { ...device, currentValue: relevantEvent.value };
          }
          return device;
        });
        onUpdateDevices(updatedDevices);
      }

      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate events");
      setIsSimulating(false);
    }
  }, [apiKey, devices, people, rules, locations, events, onUpdateDevices]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isSimulating) {
      const runSimulation = () => {
        updateSystem();
        timeoutId = setTimeout(runSimulation, 60000);
      };
      runSimulation();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSimulating, updateSystem]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">System Timeline</h3>
        <Button
          onClick={() => setIsSimulating(!isSimulating)}
          variant={isSimulating ? "destructive" : "default"}
          disabled={!apiKey}
        >
          {isSimulating ? "Stop Simulation" : "Start Simulation"}
        </Button>
      </div>

      {error && (
        <p className="text-red-500 text-sm" role="alert">{error}</p>
      )}

      {stories && (
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="overview">
            <AccordionTrigger>System Overview</AccordionTrigger>
            <AccordionContent>
              <Alert>
                <AlertDescription className="whitespace-pre-wrap">
                  {stories.overview}
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
          
          {Object.entries(stories.locationStories).map(([location, story]) => (
            <AccordionItem key={location} value={location}>
              <AccordionTrigger>{location}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription className="whitespace-pre-wrap">
                      <strong>Environment:</strong> {story.environmental}
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertDescription className="whitespace-pre-wrap">
                      <strong>Activities:</strong> {story.activities}
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertDescription className="whitespace-pre-wrap">
                      <strong>Devices:</strong> {story.deviceStatus}
                    </AlertDescription>
                  </Alert>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500">No events generated yet</p>
        ) : (
          events.map((event, index) => (
            <Card key={`${event.timestamp.getTime()}-${index}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{event.deviceName}</p>
                    <p className="text-sm text-gray-600">{event.event}</p>
                    {event.value !== undefined && (
                      <p className="text-sm">Value: {event.value}</p>
                    )}
                    <p className="text-sm text-gray-500">Location: {event.location}</p>
                  </div>
                  <time className="text-sm text-gray-500">
                    {event.timestamp.toLocaleString()}
                  </time>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}