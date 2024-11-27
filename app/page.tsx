import Image from "next/image";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Home as HomeIcon, Users, Settings, Trees } from "lucide-react";

export default function Home() {
  const [temperature, setTemperature] = useState(21);
  const [lightLevel, setLightLevel] = useState(50);
  const [deviceStatus, setDeviceStatus] = useState({
    thermostat: false,
    lights: false,
    security: false
  });
  const [occupancy, setOccupancy] = useState(0);
  const [mood, setMood] = useState("neutral");

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
        <div className="w-full flex justify-between items-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <code className="bg-black/[.05] dark:bg-white/[.06] px-3 py-1 rounded font-semibold">
            IoT Wizard
          </code>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>IoT Wizard of Oz Interface</CardTitle>
            <CardDescription>Control and simulate IoT devices and environmental conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="devices" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="devices" className="flex items-center gap-2">
                  <HomeIcon className="w-4 h-4" /> Devices
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
                    <Label>LLM Response Delay (ms)</Label>
                    <Input type="number" placeholder="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label>System Mode</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="learning">Learning</option>
                    </select>
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy Now
          </a>
          <Button
            variant="outline"
            className="rounded-full h-10 sm:h-12 px-4 sm:px-5"
          >
            Documentation
          </Button>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Templates
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Deploy →
        </a>
      </footer>
    </div>
  );
}