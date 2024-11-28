import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import deviceData from "./deviceData.json";
import { Rule, Person, Device, Location, LocationType } from "../types";
import { LocationManager } from "./LocationManager";
import { RuleManager } from "./RuleManager";
import { PeopleManager } from "./PeopleManager";
import { DeviceManager } from "./DeviceManager";

interface DeviceState {
  [key: string]: string | number | boolean;
}

export default function IoTInterface() {
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
  const [apiKey, setApiKey] = useState("");
  const [systemResponse, setSystemResponse] = useState("");

  const locationTypes: LocationType[] = ["Residential", "Office", "Retail", "Factory", "Farm"];

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

  const generateSystemState = async () => {
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
              content: "You are an IoT system assistant that generates realistic sensor data and device states."
            },
            {
              role: "user",
              content: `Generate appropriate sensor values and states for the following devices: ${JSON.stringify(installedDevices)}
                       Consider: Locations: ${JSON.stringify(locations)}
                       People: ${JSON.stringify(people)}
                       Active Rules: ${JSON.stringify(activeRules)}`
            }
          ]
        })
      });

      const data = await response.json();
      const parsedStates = JSON.parse(data.choices[0].message.content) as DeviceState;
      updateDeviceStates(parsedStates);
      setSystemResponse(data.choices[0].message.content);
    } catch (error) {
      console.error("Error generating system state:", error);
      setSystemResponse("Error generating system state. Please check your API key and try again.");
    }
  };

  const updateDeviceStates = (newStates: DeviceState) => {
    setInstalledDevices(prevDevices => 
      prevDevices.map(device => ({
        ...device,
        currentValue: newStates[device.name]
      }))
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>IoT Wizard Interface</CardTitle>
        <CardDescription>Design and simulate complex IoT environments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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

          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label>OpenAI API Key</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
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