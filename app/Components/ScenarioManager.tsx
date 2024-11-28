import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Device, Person, Rule, Scenario, SystemEvent } from "../types";

interface ScenarioManagerProps {
  devices: Device[];
  people: Person[];
  rules: Rule[];
  apiKey: string;
  onEventsGenerated: (events: SystemEvent[]) => void;
}

export function ScenarioManager({ devices, people, rules, apiKey }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [currentEvents, setCurrentEvents] = useState<SystemEvent[]>([]);
  const [newScenario, setNewScenario] = useState({
    name: "",
    description: "",
    timeOfDay: "morning",
    duration: 60
  });

  const generateScenarioEvents = async (scenario: Scenario) => {
    if (!apiKey) return;

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
              content: "Generate a sequence of IoT events for a specific scenario. Events should be realistic and follow system rules."
            },
            {
              role: "user",
              content: `Generate events for scenario: ${scenario.name}
                Description: ${scenario.description}
                Time of Day: ${scenario.timeOfDay}
                Duration: ${scenario.duration} minutes
                Devices: ${JSON.stringify(devices)}
                People: ${JSON.stringify(people)}
                Rules: ${JSON.stringify(rules)}
                Current Time: ${new Date().toISOString()}`
            }
          ]
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("Error generating scenario:", error);
      return [];
    }
  };

  const createScenario = async () => {
    const events = await generateScenarioEvents({
      ...newScenario,
      events: [],
      isActive: false
    } as Scenario);

    const scenario: Scenario = {
      ...newScenario,
      events,
      isActive: false
    };

    setScenarios([...scenarios, scenario]);
    setNewScenario({ name: "", description: "", timeOfDay: "morning", duration: 60 });
  };

  const runScenario = async (scenario: Scenario) => {
    const events = await generateScenarioEvents(scenario);
    setActiveScenario(scenario);
    setCurrentEvents(events);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Create New Scenario</Label>
        <div className="space-y-2">
          <Input
            placeholder="Scenario Name"
            value={newScenario.name}
            onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newScenario.description}
            onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
          />
          <select
            className="w-full p-2 border rounded"
            value={newScenario.timeOfDay}
            onChange={(e) => setNewScenario({ ...newScenario, timeOfDay: e.target.value })}
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={newScenario.duration}
            onChange={(e) => setNewScenario({ ...newScenario, duration: parseInt(e.target.value) })}
          />
          <Button onClick={createScenario}>Create Scenario</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scenarios.map((scenario, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{scenario.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{scenario.description}</p>
              <p className="text-sm">Time: {scenario.timeOfDay}</p>
              <p className="text-sm">Duration: {scenario.duration} minutes</p>
              <Button 
                className="mt-2"
                onClick={() => runScenario(scenario)}
                variant={activeScenario?.name === scenario.name ? "secondary" : "default"}
              >
                Run Scenario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeScenario && currentEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Current Scenario: {activeScenario.name}</h3>
          {currentEvents.map((event, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
}