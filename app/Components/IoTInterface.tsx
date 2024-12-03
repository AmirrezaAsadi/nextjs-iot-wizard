"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings } from "lucide-react";
import { deviceData } from "./deviceData";
import { Rule, Person, Device, Location, LocationType } from "../types";
import { LocationManager } from "./LocationManager";
import { RuleManager } from "./RuleManager";
import { PeopleManager } from "./PeopleManager";
import { DeviceManager } from "./DeviceManager";
import { EventsManager } from "./EventsManager";

type DeviceStateValue = string | number | boolean;
type DeviceStates = Record<string, DeviceStateValue>;

export default function IoTInterface() {
  const [apiKey, setApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [installedDevices, setInstalledDevices] = useState<Device[]>([]);
  const [activeRules, setActiveRules] = useState<Rule[]>([
    {
      name: "Safety Priority",
      description: "The system should prioritize safety",
      isActive: true
    },
    {
      name: "Energy Saving",
      description: "The system should prioritize energy saving",
      isActive: true
    }
  ]);
  const [systemResponse, setSystemResponse] = useState("");
  const locationTypes: LocationType[] = ["Residential", "Office", "Retail", "Factory", "Farm"];

  const handleApiKeySubmit = () => {
    if (apiKey.trim().length > 0) {
      setIsApiKeySet(true);
    }
  };

  const addLocation = (newLocation: Location) => {
    setLocations([...locations, newLocation]);
  };

  const addPerson = (newPerson: Person) => {
    setPeople([...people, newPerson]);
  };

  const installDevice = (device: Device, location: string) => {
    const newDevice = { ...device, location };
    setInstalledDevices([...installedDevices, newDevice]);
  };

  const removeDevice = (deviceToRemove: Device) => {
    setInstalledDevices(prev => 
      prev.filter(device => 
        !(device.name === deviceToRemove.name && device.location === deviceToRemove.location)
      )
    );
  };

  const generateSystemState = async () => {
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
              content: `You are an IoT system assistant that generates realistic sensor data and device states.
                       Your response should be a valid JSON object where keys are device names and values are appropriate readings.
                       For boolean devices, use true/false. For numeric devices, use numbers. For text devices, use strings.`
            },
            {
              role: "user",
              content: `Generate appropriate sensor values and states for these devices: ${JSON.stringify(installedDevices)}
                       Consider the following context:
                       Locations: ${JSON.stringify(locations)}
                       People: ${JSON.stringify(people)}
                       Active Rules: ${JSON.stringify(activeRules)}
                       
                       Respond with a JSON object only, no additional text.
                       Example format: {"Device1": 23.5, "Device2": true, "Device3": "active"}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from API");
      }

      const content = data.choices[0].message.content.trim();
      const parsedStates = JSON.parse(content) as DeviceStates;
      updateDeviceStates(parsedStates);
      setSystemResponse("Successfully updated device states");
    } catch (error) {
      console.error("API Error:", error);
      setSystemResponse(`Error: ${error instanceof Error ? error.message : "Failed to generate system state"}`);
    }
  };

  const updateDeviceStates = (newStates: DeviceStates) => {
    setInstalledDevices(prevDevices => 
      prevDevices.map(device => ({
        ...device,
        currentValue: newStates[device.name] !== undefined 
          ? newStates[device.name] 
          : device.currentValue
      }))
    );
  };

  if (!isApiKeySet) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Welcome to IoT Wizard</CardTitle>
          <CardDescription>Please enter your OpenAI API key to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>OpenAI API Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
          </div>
          <Button onClick={handleApiKeySubmit} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>IoT Wizard Interface</CardTitle>
        <CardDescription>Design and simulate complex IoT environments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            <LocationManager 
              locations={locations} 
              onAddLocation={addLocation}
              locationTypes={locationTypes}
            />
          </TabsContent>

          <TabsContent value="devices">
            <DeviceManager
              deviceCategories={deviceData}
              locations={locations}
              installedDevices={installedDevices}
              onInstallDevice={installDevice}
              onRemoveDevice={removeDevice}
            />
          </TabsContent>

          <TabsContent value="people">
            <PeopleManager
              people={people}
              onAddPerson={addPerson}
            />
          </TabsContent>

          <TabsContent value="rules">
            <RuleManager
              rules={activeRules}
              onUpdateRules={setActiveRules}
            />
          </TabsContent>

          <TabsContent value="events">
            <EventsManager
              devices={installedDevices}
              people={people}
              rules={activeRules}
              locations={locations}
              apiKey={apiKey}
              onUpdateDevices={setInstalledDevices}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label>OpenAI API Key</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Update your OpenAI API key"
                />
              </div>
              <Button onClick={generateSystemState}>
                Generate System State
              </Button>
              {systemResponse && (
                <Alert>
                  <AlertDescription>{systemResponse}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}