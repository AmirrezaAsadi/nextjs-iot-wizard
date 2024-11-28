import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";
import type { Device, DeviceManagerProps, DeviceType } from "../types";

export function DeviceManager({ 
  deviceCategories, 
  locations, 
  installedDevices, 
  onInstallDevice,
  onRemoveDevice 
}: DeviceManagerProps & { onRemoveDevice: (device: Device) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showCustomDeviceForm, setShowCustomDeviceForm] = useState(false);
  const [customDevice, setCustomDevice] = useState<Device>({
    name: "",
    description: "",
    type: "sensor",
    dataType: "number",
    interface: {
      display: "numeric",
      app: true,
      voice: false
    },
    features: [],
    category: "Custom Devices"
  });
  const [newFeature, setNewFeature] = useState("");

  const handleInstall = () => {
    if (selectedDevice && selectedLocation) {
      onInstallDevice(selectedDevice, selectedLocation);
      setSelectedDevice(null);
      setSelectedLocation("");
      setSelectedCategory("");
    }
  };

  const handleAddCustomFeature = () => {
    if (newFeature) {
      setCustomDevice(prev => ({
        ...prev,
        features: [...prev.features, newFeature]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setCustomDevice(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleCreateCustomDevice = () => {
    if (!selectedLocation || !customDevice.name) return;
    
    const newDevice: Device = {
      ...customDevice,
      isCustom: true
    };
    onInstallDevice(newDevice, selectedLocation);
    setShowCustomDeviceForm(false);
    setCustomDevice({
      name: "",
      description: "",
      type: "sensor",
      dataType: "number",
      interface: {
        display: "numeric",
        app: true,
        voice: false
      },
      features: [],
      category: "Custom Devices"
    });
    setSelectedLocation("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Device Management</h3>
        <Button onClick={() => setShowCustomDeviceForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Custom Device
        </Button>
      </div>

      {!showCustomDeviceForm ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              className="w-full p-2 border rounded"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedDevice(null);
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

          {selectedCategory && (
            <div className="space-y-2">
              <Label>Device</Label>
              <select
                className="w-full p-2 border rounded"
                value={selectedDevice?.name || ""}
                onChange={(e) => {
                  const device = deviceCategories
                    .find(cat => cat.category === selectedCategory)
                    ?.devices.find(d => d.name === e.target.value);
                  setSelectedDevice(device || null);
                }}
              >
                <option value="">Select Device</option>
                {deviceCategories
                  .find(cat => cat.category === selectedCategory)
                  ?.devices.map((device) => (
                    <option key={device.name} value={device.name}>
                      {device.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {selectedDevice && (
            <div className="space-y-2">
              <Label>Location</Label>
              <select
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

          {selectedDevice && selectedLocation && (
            <Button onClick={handleInstall}>Install Device</Button>
          )}
        </div>
      ) : (
        <div className="space-y-4 border p-4 rounded-lg">
          <h4 className="font-medium">Create Custom Device</h4>
          
          <div className="space-y-2">
            <Label>Device Name</Label>
            <Input
              value={customDevice.name}
              onChange={(e) => setCustomDevice(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter device name"
            />
          </div>

          <div className="space-y-2">
            <Label>Device Type</Label>
            <select
              className="w-full p-2 border rounded"
              value={customDevice.type}
              onChange={(e) => setCustomDevice(prev => ({ ...prev, type: e.target.value as DeviceType }))}
            >
              <option value="sensor">Sensor</option>
              <option value="actuator">Actuator</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={customDevice.description}
              onChange={(e) => setCustomDevice(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter device description"
            />
          </div>

          <div className="space-y-2">
            <Label>Data Type</Label>
            <select
              className="w-full p-2 border rounded"
              value={customDevice.dataType}
              onChange={(e) => setCustomDevice(prev => ({ ...prev, dataType: e.target.value }))}
            >
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="string">Text</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Unit (optional)</Label>
            <Input
              value={customDevice.unit || ""}
              onChange={(e) => setCustomDevice(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="Enter unit (e.g., °C, %, lux)"
            />
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add feature"
              />
              <Button onClick={handleAddCustomFeature}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {customDevice.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-2"
                >
                  {feature}
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <select
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

          <div className="flex gap-2">
            <Button 
              onClick={handleCreateCustomDevice} 
              disabled={!customDevice.name || !selectedLocation}
            >
              Create and Install
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCustomDeviceForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Installed Devices List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Installed Devices</h3>
        <div className="grid grid-cols-1 gap-4">
          {installedDevices.map((device) => (
            <Card key={`${device.name}-${device.location}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{device.name}</CardTitle>
                  <CardDescription>Location: {device.location}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveDevice(device)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{device.description}</p>
                  <p className="text-sm">Type: {device.type}</p>
                  {device.features && device.features.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Features:</p>
                      <ul className="list-disc list-inside">
                        {device.features.map((feature, index) => (
                          <li key={index} className="text-sm">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {device.currentValue !== undefined && device.currentValue !== null && (
                    <p className="text-sm font-medium">
                      Current Value: {String(device.currentValue)} {device.unit || ""}
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