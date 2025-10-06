import { useState, useEffect } from 'react';
import { useBaby } from '../context/BabyContext';
import { activityConfig, type ActivityType } from '../lib/activityConfig';
// Using native JavaScript date functions instead of date-fns

interface TimelineEvent {
  id: string;
  type: ActivityType;
  datetime: string;
  title: string;
  description?: string;
  quantity?: number | string;
  unit?: string;
}

interface TimelineRibbonProps {
  babyId: string;
}

export default function TimelineRibbon({ babyId }: TimelineRibbonProps) {
  const { babyData } = useBaby();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the last 30 hours, with right edge rounded to next hour
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Round up to next hour if there are minutes
  const endHour = currentMinute > 0 ? currentHour + 1 : currentHour;
  const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, 0, 0);
  
  // Start time is 30 hours before the end time
  const startTime = new Date(endTime.getTime() - 30 * 60 * 60 * 1000);

  useEffect(() => {
    if (!babyId || !babyData) {
      setLoading(false);
      return;
    }

    const processTimelineEvents = () => {
      setLoading(true);
      try {
        const startDateTime = startTime.toISOString();
        const endDateTime = endTime.toISOString();

        // Process all datetime-based events from context
        const eventTypes: ActivityType[] = ['bottle', 'meal', 'breast', 'pump', 'diaper'];
        const allEvents: TimelineEvent[] = [];

        for (const eventType of eventTypes) {
          const config = activityConfig[eventType];
          let data: any[] = [];

          // Get data from context based on event type
          switch (eventType) {
            case 'bottle':
              data = babyData.bottles || [];
              break;
            case 'meal':
              data = babyData.meals || [];
              break;
            case 'breast':
              data = babyData.breast || [];
              break;
            case 'pump':
              data = babyData.pumps || [];
              break;
            case 'diaper':
              data = babyData.diapers || [];
              break;
          }

          // Filter events within the time range
          const filteredData = data.filter(item => {
            const itemTime = item.date_time;
            return itemTime >= startDateTime && itemTime <= endDateTime;
          });

          const typedEvents: TimelineEvent[] = filteredData.map(item => ({
            id: item.id,
            type: eventType,
            datetime: item.date_time,
            title: config.title,
            description: item.comment,
            quantity: item.quantity,
            unit: config.unit
          }));

          allEvents.push(...typedEvents);
        }

        // Sort all events by datetime (most recent first)
        allEvents.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

        setEvents(allEvents);
      } catch (error) {
        console.error('Error processing timeline events:', error);
      } finally {
        setLoading(false);
      }
    };

    processTimelineEvents();
  }, [babyId, babyData]);

  const getHourLabel = (datetime: string) => {
    const date = new Date(datetime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const getFilteredEvents = () => {
    // Filter events to only show those within the 30-hour window
    return events.filter(event => {
      const eventTime = new Date(event.datetime);
      return eventTime >= startTime && eventTime <= endTime;
    });
  };

  const getHourPosition = (datetime: string) => {
    const eventTime = new Date(datetime);
    const timeDiff = eventTime.getTime() - startTime.getTime();
    const hoursFromStart = timeDiff / (1000 * 60 * 60);
    
    // Calculate position as percentage of 30 hours
    return (hoursFromStart / 30) * 100;
  };

  const generateHourMarkers = () => {
    const markers = [];
    
    // Generate markers for each hour in the 30-hour window
    for (let hour = 0; hour <= 30; hour++) {
      const markerTime = new Date(startTime.getTime() + hour * 60 * 60 * 1000);
      const position = (hour / 30) * 100;
      
      // Show labels for midnight (0h), 6h, 12h, 18h, and 24h (next midnight)
      const hourOfDay = markerTime.getHours();
      const showLabel = hourOfDay === 0 || hourOfDay === 6 || hourOfDay === 12 || hourOfDay === 18;
      
      markers.push({
        hour,
        position,
        label: showLabel ? `${hourOfDay.toString().padStart(2, '0')}h` : '',
        dateTime: markerTime
      });
    }
    return markers;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();
  const hourMarkers = generateHourMarkers();

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="relative">
        {/* Timeline header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="font-medium text-gray-900">
            Dernières 30 heures
          </h3>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Single timeline ribbon */}
        <div className="relative ml-2 h-20 bg-gray-50 rounded-lg">
          {/* Main timeline line - horizontal line in the middle */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400 transform -translate-y-1/2"></div>
          
          {/* Hour markers - centered in the middle */}
          <div className="absolute inset-0 flex items-center">
            {hourMarkers.map(marker => (
              <div
                key={marker.hour}
                className="flex-1 relative"
                style={{ width: `${100 / 30}%` }}
              >
                {/* Vertical line for each hour */}
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-4 ${
                  marker.dateTime.getHours() === 0 ? 'bg-gray-600 h-6' : 'bg-gray-300'
                }`}></div>
                
                {/* Hour label above the line */}
                {marker.label && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium">
                    {marker.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Events - icons on timeline */}
          <div className="absolute inset-0">
            {(() => {
              // Group events by position to handle overlapping
              const eventsByPosition: { [key: string]: TimelineEvent[] } = {};

              filteredEvents.forEach(event => {
                const position = getHourPosition(event.datetime);
                // Use a more generous grouping - round to nearest 2% to group close events
                const positionKey = Math.round(position / 2) * 2;

                if (!eventsByPosition[positionKey]) {
                  eventsByPosition[positionKey] = [];
                }
                eventsByPosition[positionKey].push(event);
              });

              return Object.entries(eventsByPosition).map(([position, eventsAtPosition]) => {
                const positionNum = parseFloat(position);

                return (
                  <div
                    key={position}
                    className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${positionNum}%` }}
                  >
                    {/* Stack icons vertically if multiple events at same time */}
                    <div className="flex flex-col items-center space-y-2">
                      {eventsAtPosition.map((event) => {
                        const config = activityConfig[event.type];
                        const IconComponent = config.icon;

                        return (
                          <div
                            key={event.id}
                            className="relative group"
                          >
                            {/* Icon on timeline */}
                            <div className={`
                              w-8 h-8 rounded-full border-2 border-white shadow-lg
                              flex items-center justify-center
                              ${config.color.replace('bg-', 'bg-').replace('-50', '-500')}
                            `}>
                              <IconComponent size={16} className={config.textColor.replace('text-', 'text-').replace('-700', '-100')} />
                            </div>

                            {/* Event details tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="font-medium">{event.title}</div>
                              <div className="text-gray-300">{getHourLabel(event.datetime)}</div>
                              {event.quantity && (
                                <div className="text-gray-300">
                                  {event.quantity} {event.unit}
                                </div>
                              )}
                              {event.description && (
                                <div className="text-gray-300 max-w-xs truncate">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Time range at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 font-medium px-2">
            <div>{formatDate(startTime)}</div>
            <div>{formatDate(endTime)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
