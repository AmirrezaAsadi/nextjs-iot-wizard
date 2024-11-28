// deviceData.ts
import { Category } from "../types";

const deviceData: Category[] = [
  {
    category: "Environmental Sensors",
    devices: [
      {
        name: "Temperature Sensor",
        description: "Measures ambient temperature",
        type: "sensor",
        dataType: "Number",
        unit: "degrees Celsius",
        interface: {
          display: "Numeric",
          app: "Graph",
          voice: false
        },
        features: [
          "Alarms for high/low thresholds"
        ]
      },
      {
        name: "Humidity Sensor",
        description: "Measures relative humidity",
        type: "sensor",
        dataType: "Number",
        unit: "percentage",
        interface: {
          display: "Numeric",
          app: "Graph",
          voice: false
        },
        features: [
          "Alarms for high/low thresholds"
        ]
      },
      {
        name: "Air Quality Sensor",
        description: "Measures various pollutants (e.g., CO2, VOCs, PM2.5)",
        type: "sensor",
        dataType: "Number",
        unit: "ppm or µg/m³",
        interface: {
          display: "Numeric",
          app: true,
          voice: false
        },
        features: [
          "Alarms",
          "Recommendations for improving air quality"
        ]
      }
    ]
  },
  {
    category: "Actuators and Controllers",
    devices: [
      {
        name: "Smart Plug",
        description: "Controls power to connected devices",
        type: "actuator",
        dataType: "Boolean",
        interface: {
          display: "Physical button",
          app: true,
          voice: true
        },
        features: [
          "Energy monitoring",
          "Scheduling",
          "Scenes"
        ]
      },
      {
        name: "Smart Light Bulb",
        description: "Controls light color and brightness",
        type: "actuator",
        dataType: "String",
        interface: {
          display: false,
          app: "Color picker and brightness slider",
          voice: true
        },
        features: [
          "Schedules",
          "Scenes",
          "Music sync",
          "Wake-up light"
        ]
      },
      {
        name: "Smart Thermostat",
        description: "Controls HVAC settings",
        type: "actuator",
        dataType: "Number",
        unit: "temperature",
        interface: {
          display: "LCD",
          app: true,
          voice: true
        },
        features: [
          "Schedules",
          "Geofencing",
          "Energy reports",
          "HVAC maintenance alerts"
        ]
      }
    ]
  }
];

export default deviceData;