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
              content: `You are an IoT event simulator. Generate realistic events considering:
                - Device capabilities and locations
                - User activities and schedules
                - System rules and priorities
                - Time-appropriate behaviors
                Return only valid JSON array of events.`
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
      const newEvents = JSON.parse(data.choices[0].message.content);
      setEvents(prev => [...prev, ...newEvents]
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
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      generateEvents();
      interval = setInterval(generateEvents, 60000);
    }
    return () => clearInterval(interval);
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
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500">No events generated yet</p>
        ) : (
          events.map((event, index) => (
            <Card key={index}>
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