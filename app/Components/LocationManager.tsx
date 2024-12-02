import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location, LocationManagerProps } from "../types";

export function LocationManager({ locations, onAddLocation, locationTypes }: LocationManagerProps) {
  const [newLocation, setNewLocation] = useState<Location>({
    name: "",
    type: "Residential",
    parent: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.name || !newLocation.type) return;
    
    onAddLocation(newLocation);
    setNewLocation({ 
      name: "", 
      type: "Residential", 
      parent: undefined 
    });
  };

  const handleTypeChange = (type: string) => {
    if (type === "Residential" || type === "Office" || type === "Retail" || type === "Factory" || type === "Farm") {
      setNewLocation({ ...newLocation, type });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {locations.map((location) => (
          <Card key={location.name}>
            <CardHeader>
              <CardTitle className="text-xl">{location.name}</CardTitle>
              <CardDescription>{location.type}</CardDescription>
            </CardHeader>
            <CardContent>
              {location.parent && <p className="text-sm text-gray-600">Parent Location: {location.parent}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="locationName">Location Info</Label>
          <Input
            id="locationName"
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            placeholder="Describe  location such as  building name, city , size , country, etc"
            required
          />
        </div>

        <div>
          <Label htmlFor="locationType">Location Type</Label>
          <select
            id="locationType"
            className="w-full p-2 border rounded"
            value={newLocation.type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {locationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="parentLocation">Parent Location (Optional)</Label>
          <select
            id="parentLocation"
            className="w-full p-2 border rounded"
            value={newLocation.parent || ""}
            onChange={(e) => setNewLocation({ ...newLocation, parent: e.target.value || undefined })}
          >
            <option value="">None</option>
            {locations.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit">Add Location</Button>
      </form>
    </div>
  );
}