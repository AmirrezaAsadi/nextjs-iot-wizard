import { Card, CardContent } from "@/components/ui/card";
import { SystemEvent } from "../types";

interface EventsDisplayProps {
  events: SystemEvent[];
}

export function EventsDisplay({ events }: EventsDisplayProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">System Events</h2>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-gray-500">No events to display</p>
        ) : (
          events.map((event, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{event.deviceName}</p>
                    <p className="text-sm">{event.event}</p>
                    <p className="text-sm text-gray-500">Location: {event.location}</p>
                    {event.value !== undefined && (
                      <p className="text-sm">Value: {event.value}</p>
                    )}
                  </div>
                  <time className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </time>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}