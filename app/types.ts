// types.ts

export type DeviceType = "sensor" | "actuator";

export interface Device {
  name: string;
  description: string;
  type: DeviceType;
  dataType: string;
  unit?: string;
  interface: {
    display: string | boolean;
    app: string | boolean;
    voice: string | boolean;
  };
  features: string[];
  location?: string;
  currentValue?: unknown;
  category?: string;
  isCustom?: boolean;
}
  
  export interface Category {
    category: string;
    devices: Device[];
  }
  
  export type LocationType = "Residential" | "Office" | "Retail" | "Factory" | "Farm";
  
  export interface Location {
    name: string;
    type: LocationType;
    parent?: string;
  }
  
  export interface Person {
    name: string;
    age: number;
    keyActivities: string[];
    goals: string[];
  }
  
  export interface Rule {
    name: string;
    description: string;
    isActive: boolean;
  }
  
  // Component Props Interfaces
  export interface LocationManagerProps {
    locations: Location[];
    onAddLocation: (location: Location) => void;
    locationTypes: LocationType[];
  }
  
  export interface DeviceManagerProps {
    deviceCategories: Category[];
    locations: Location[];
    installedDevices: Device[];
    onInstallDevice: (device: Device, location: string) => void;
  }
  
  export interface PeopleManagerProps {
    people: Person[];
    onAddPerson: (person: Person) => void;
  }
  
  export interface RuleManagerProps {
    rules: Rule[];
    onUpdateRules: (rules: Rule[]) => void;
  }