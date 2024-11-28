"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Users, Settings, Trees } from "lucide-react";

interface DeviceStatus {
  thermostat: boolean;
  lights: boolean;
  security: boolean;
}

export default function IoTInterface() {
  const [temperature, setTemperature] = useState(21);
  const [lightLevel, setLightLevel] = useState(50);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    thermostat: false,
    lights: false,
    security: false
  });
  const [occupancy, setOccupancy] = useState(0);
  const [mood, setMood] = useState("neutral");
  const [apiKey, setApiKey] = useState("");
  const [systemResponse, setSystemResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("openai_api_key", newKey);
  };

  const generateSystemResponse = async () => {
    if (!apiKey) {
      setSystemResponse("Please enter an OpenAI API key first.");
      return;
    }

    setIsLoading(true);
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
              content: "You are an IoT system assistant that helps manage smart home devices.",
            },
            {
              role: "user",
              content: `Current system state:
                Temperature: ${temperature}°C
                Light Level: ${lightLevel}%
                Occupancy: ${occupancy}
                Mood: ${mood}
                Devices: ${JSON.stringify(deviceStatus)}
                
                Please analyze the current state and provide recommendations.`,
            },
          ],
        }),
      });

      const data = await response.json();
      setSystemResponse(data.choices[0].message.content);
    } catch (error) {
      setSystemResponse("Error communicating with OpenAI API. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>IoT Wizard of Oz Interface</CardTitle>
        <CardDescription>Control and simulate IoT devices and environmental conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Devices
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> People
            </TabsTrigger>
            <TabsTrigger value="environment" className="flex items-center gap-2">
              <Trees className="w-4 h-4" /> Environment
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="thermostat">Thermostat</Label>
                <Switch 
                  id="thermostat" 
                  checked={deviceStatus.thermostat}
                  onCheckedChange={(checked) => 
                    setDeviceStatus(prev => ({...prev, thermostat: checked}))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lights">Lights</Label>
                <Switch 
                  id="lights"
                  checked={deviceStatus.lights}
                  onCheckedChange={(checked) => 
                    setDeviceStatus(prev => ({...prev, lights: checked}))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="security">Security System</Label>
                <Switch 
                  id="security"
                  checked={deviceStatus.security}
                  onCheckedChange={(checked) => 
                    setDeviceStatus(prev => ({...prev, security: checked}))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="people">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Number of Occupants</Label>
                <Input 
                  type="number" 
                  value={occupancy}
                  onChange={(e) => setOccupancy(parseInt(e.target.value))}
                  min={0}
                  max={10}
                />
              </div>
              <div className="space-y-2">
                <Label>Occupant Mood</Label>
                <select 
                  className="w-full p-2 border rounded"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                >
                  <option value="happy">Happy</option>
                  <option value="neutral">Neutral</option>
                  <option value="tired">Tired</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="environment">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Slider
                  value={[temperature]}
                  onValueChange={([value]) => setTemperature(value)}
                  max={30}
                  min={16}
                  step={1}
                />
                <div className="text-right">{temperature}°C</div>
              </div>
              <div className="space-y-2">
                <Label>Light Level (%)</Label>
                <Slider
                  value={[lightLevel]}
                  onValueChange={([value]) => setLightLevel(value)}
                  max={100}
                  min={0}
                  step={1}
                />
                <div className="text-right">{lightLevel}%</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                />
              </div>
              <Button 
                onClick={generateSystemResponse}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Analyze System State"}
              </Button>
              {systemResponse && (
                <Alert>
                  <AlertDescription>
                    {systemResponse}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}