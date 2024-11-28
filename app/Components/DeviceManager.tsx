import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Device, DeviceManagerProps } from "../types";

export function DeviceManager({ 
  deviceCategories, 
  locations, 
  installedDevices, 
  onInstallDevice 
}: DeviceManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const handleInstall = () => {
    if (selectedDevice && selectedLocation) {
      onInstallDevice(selectedDevice, selectedLocation);
      setSelectedDevice(null);
      setSelectedLocation("");
      setSelectedCategory("");
    }
  };

  const getCategoryDevices = (categoryName: string): Device[] => {
    const category = deviceCategories.find(cat => cat.category === categoryName);
    return category ? category.devices : [];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="w-full p-2 border rounded"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedDevice(null);
              setSelectedLocation("");
            }}
          >
            <option value="">Select Category</option>
            {deviceCategories.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>

        {/* Device Selection */}
        {selectedCategory && (
          <div className="space-y-2">
            <Label htmlFor="device">Device</Label>
            <select
              id="device"
              className="w-full p-2 border rounded"
              value={selectedDevice?.name || ""}
              onChange={(e) => {
                const device = getCategoryDevices(selectedCategory)
                  .find(d => d.name === e.target.value);
                setSelectedDevice(device || null);
              }}
            >
              <option value="">Select Device</option>
              {getCategoryDevices(selectedCategory).map((device) => (
                <option key={device.name} value={device.name}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location Selection */}
        {selectedDevice && (
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <select
              id="location"
              className="w-full p-2 border rounded"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.name} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Install Button */}
        {selectedDevice && selectedLocation && (
          <Button onClick={handleInstall} className="w-full">
            Install Device
          </Button>
        )}
      </div>

      {/* Installed Devices List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Installed Devices</h3>
        <div className="grid grid-cols-1 gap-4">
          {installedDevices.map((device) => (
            <Card key={`${device.name}-${device.location}`}>
              <CardHeader>
                <CardTitle>{device.name}</CardTitle>
                <CardDescription>Location: {device.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{device.description}</p>
                  {device.features && device.features.length > 0 && (
                    <div>
                      <p className="font-medium">Features:</p>
                      <ul className="list-disc list-inside">
                        {device.features.map((feature, index) => (
                          <li key={index} className="text-sm">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {device.currentValue !== undefined && (
                    <p className="text-sm font-medium">
                      Current Value: {String(device.currentValue)} {device.unit || ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}