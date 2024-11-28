export type LocationType = "Residential" | "Office" | "Retail" | "Factory" | "Farm";
export type DeviceType = "sensor" | "actuator";
export type EventType = "measurement" | "state_change" | "alert" | "interaction" | "maintenance";

export interface SystemEvent {
  timestamp: Date;
  deviceName: string;
  location: string;
  event: string;
  value?: string | number | boolean;
}

export interface Scenario {
  name: string;
  description: string;
  timeOfDay: string;
  duration: number; // in minutes
  events: SystemEvent[];
  isActive: boolean;
}

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
  currentValue?: string | number | boolean;
  category?: string;
  isCustom?: boolean;
}

export interface Category {
  category: string;
  devices: Device[];
}

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

  export interface Scenario {
    name: string;
    description: string;
    timeOfDay: string;
    duration: number; // in minutes
    events: SystemEvent[];
    isActive: boolean;
  }
  