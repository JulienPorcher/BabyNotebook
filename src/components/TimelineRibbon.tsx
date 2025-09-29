import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
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
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the last 24 hours
  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  const endTime = now;

  useEffect(() => {
    if (!babyId || !user?.id) return;

    const fetchTimelineEvents = async () => {
      setLoading(true);
      try {
        const startDateTime = startTime.toISOString();
        const endDateTime = endTime.toISOString();

        // Fetch all datetime-based events
        const eventTypes: ActivityType[] = ['bottle', 'meal', 'breast', 'pump', 'diaper'];
        const allEvents: TimelineEvent[] = [];

        for (const eventType of eventTypes) {
          const config = activityConfig[eventType];
          const { data, error } = await supabase
            .from(config.table)
            .select('*')
            .eq('baby_id', babyId)
            .eq('user_id', user.id)
            .gte('date_time', startDateTime)
            .lte('date_time', endDateTime)
            .order('date_time', { ascending: false });

          if (error) {
            console.error(`Error fetching ${eventType}:`, error);
            continue;
          }

          const typedEvents: TimelineEvent[] = (data || []).map(item => ({
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
        console.error('Error fetching timeline events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineEvents();
  }, [babyId, user?.id]);

  const getDayLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Aujourd\'hui';
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    return `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const getHourLabel = (datetime: string) => {
    const date = new Date(datetime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const groupEventsByDay = () => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    
    // Always include today, even if no events
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    
    // Initialize with empty array for today
    groups[todayKey] = [];
    
    // Add events to their respective days
    events.forEach(event => {
      const eventDate = new Date(event.datetime);
      const dayKey = eventDate.toISOString().split('T')[0]; // yyyy-MM-dd format
      
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(event);
    });

    return groups;
  };

  const getHourPosition = (datetime: string) => {
    const eventTime = new Date(datetime);
    const hours = eventTime.getHours();
    const minutes = eventTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Calculate position as percentage of 24 hours
    return (totalMinutes / (24 * 60)) * 100;
  };

  const generateHourMarkers = () => {
    const markers = [];
    for (let hour = 0; hour < 24; hour++) {
      const position = (hour / 24) * 100;
      // Show 0h, 6h, 12h, 18h, and 24h (which is 0h of next day)
      const showLabel = hour === 0 || hour === 6 || hour === 12 || hour === 18 || hour === 24;
      markers.push({
        hour,
        position,
        label: showLabel ? `${hour.toString().padStart(2, '0')}h` : ''
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

  const dayGroups = groupEventsByDay();
  // Always show today
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  
  const sortedDays = [todayKey].filter(dayKey => dayGroups[dayKey] !== undefined);
  

  const hourMarkers = generateHourMarkers();

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      
      <div className="space-y-6">
        {sortedDays.map(dayKey => {
          const dayEvents = dayGroups[dayKey];
          const dayDate = new Date(dayKey);
          
          return (
            <div key={dayKey} className="relative">
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">
                  {getDayLabel(dayDate)}
                </h3>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Timeline for this day */}
              <div className="relative ml-2 h-20 bg-gray-50 rounded-lg">
                {/* Main timeline line - horizontal line in the middle */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400 transform -translate-y-1/2"></div>
                
                {/* Hour markers - centered in the middle */}
                <div className="absolute inset-0 flex items-center">
                  {hourMarkers.map(marker => (
                    <div
                      key={marker.hour}
                      className="flex-1 relative"
                      style={{ width: `${100 / 24}%` }}
                    >
                      {/* Vertical line for each hour */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-4 bg-gray-300"></div>
                      
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
                    
                    dayEvents.forEach(event => {
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
                            {eventsAtPosition.map((event, index) => {
                              const config = activityConfig[event.type];
                              const IconComponent = config.icon;
                              
                              // Alternate positioning for better visual distribution
                              const offset = eventsAtPosition.length > 1 ? (index - (eventsAtPosition.length - 1) / 2) * 0.5 : 0;
                              
                              return (
                                <div
                                  key={event.id}
                                  className="relative group"
                                  style={{ transform: `translateX(${offset}rem)` }}
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

                {/* Date at bottom centered with 12h */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  <div className="text-xs text-gray-500 font-medium">
                    {formatDate(new Date(dayKey))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
