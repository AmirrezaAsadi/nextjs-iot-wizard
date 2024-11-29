import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Device, Person, Rule, SystemEvent, Location } from "../types";

interface EventsManagerProps {
  devices: Device[];
  people: Person[];
  rules: Rule[];
  locations: Location[];
  apiKey: string;
}

// Helper function to validate individual fields
function validateEventField(
  event: unknown,
  field: keyof SystemEvent,
  expectedType: string
): { valid: boolean; error?: string } {
  const value = (event as Partial<SystemEvent>)[field];
  
  if (value === undefined) {
    return { valid: false, error: `Missing required field: ${field}` };
  }
  
  if (typeof value !== expectedType) {
    return { 
      valid: false, 
      error: `Invalid type for ${field}: expected ${expectedType}, got ${typeof value}` 
    };
  }
  
  if (field === 'timestamp' && Number.isNaN(new Date(value as string).getTime())) {
    return { valid: false, error: `Invalid timestamp format: ${value}` };
  }
  
  return { valid: true };
}

// Enhanced type guard with detailed validation
function isValidSystemEvent(event: unknown): event is SystemEvent {
  if (!event || typeof event !== 'object') {
    console.error('Event is not an object:', event);
    return false;
  }

  const validations = [
    validateEventField(event, 'deviceName', 'string'),
    validateEventField(event, 'event', 'string'),
    validateEventField(event, 'location', 'string'),
    validateEventField(event, 'timestamp', 'string')
  ];

  // Special handling for optional value field
  const eventObj = event as Partial<SystemEvent>;
  if ('value' in eventObj && eventObj.value !== undefined) {
    const valueType = typeof eventObj.value;
    if (valueType !== 'number' && valueType !== 'string') {
      validations.push({
        valid: false,
        error: `Invalid type for value: expected number or string, got ${valueType}`
      });
    }
  }

  const failures = validations.filter(v => !v.valid);
  if (failures.length > 0) {
    console.error('Event validation failed:', {
      event,
      errors: failures.map(f => f.error)
    });
    return false;
  }

  return true;
}

function isValidEventArray(events: unknown): events is SystemEvent[] {
  if (!Array.isArray(events)) {
    console.error('Expected array of events, got:', typeof events);
    return false;
  }

  const invalidEvents = events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => !isValidSystemEvent(event));

  if (invalidEvents.length > 0) {
    console.error('Invalid events found:', invalidEvents);
    return false;
  }

  return true;
}

export function EventsManager({ devices, people, rules, locations, apiKey }: EventsManagerProps) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEvents = useCallback(async () => {
    if (!apiKey) {
      setError("Please enter an API key");
      return;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an IoT event simulator. Generate a JSON array of events with this exact structure:
                [
                  {
                    "deviceName": "string",
                    "event": "string",
                    "location": "string",
                    "timestamp": "ISO date string",
                    "value": "number or string (optional)"
                  }
                ]
                Consider:
                - Device capabilities and locations
                - User activities and schedules
                - System rules and priorities
                - Time-appropriate behaviors`
            },
            {
              role: "user",
              content: `Generate next hour's events for:
                Locations: ${locations.map(l => `${l.name} (${l.type})`).join(', ')}
                
                Devices: ${devices.map(d => 
                  `${d.name} in ${d.location || 'unspecified'} (${d.type})`
                ).join(', ')}
                
                People: ${people.map(p => 
                  `${p.name}: ${p.keyActivities.join(', ')}`
                ).join(', ')}
                
                Rules: ${rules.filter(r => r.isActive).map(r => r.description).join(', ')}
                
                Start time: ${new Date().toISOString()}`
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let parsedEvents: unknown;
      
      try {
        parsedEvents = JSON.parse(data.choices[0].message.content);
        console.log('Parsed events:', parsedEvents);
      } catch {
        throw new Error('Invalid JSON response from API');
      }

      // Validate the parsed events
      if (!isValidEventArray(parsedEvents)) {
        throw new Error('API returned invalid event data structure. Check console for details.');
      }

      setEvents(prev => [...prev, ...parsedEvents]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-50) // Keep last 50 events
      );
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate events");
      setIsSimulating(false);
    }
  }, [apiKey, devices, people, rules, locations]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    const runSimulation = () => {
      generateEvents();
      timeoutId = setTimeout(runSimulation, 60000);
    };

    if (isSimulating) {
      runSimulation();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSimulating, generateEvents]);

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

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500">No events generated yet</p>
        ) : (
          events.map((event, index) => (
            <Card key={`${event.timestamp}-${index}`}>
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
                    {new Date(event.timestamp).toLocaleString()}
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