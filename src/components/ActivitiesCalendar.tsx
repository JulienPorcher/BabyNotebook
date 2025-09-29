import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { activityConfig, type ActivityType } from '../lib/activityConfig';

interface CalendarEvent {
  id: string;
  type: ActivityType;
  date: string;
  datetime?: string; // For datetime events
  title: string;
  description?: string;
}

interface ActivitiesCalendarProps {
  babyId: string;
}

export default function ActivitiesCalendar({ babyId }: ActivitiesCalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get the first day of the current month and calculate the calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfMonth.getDay());
  
  const lastDayOfCalendar = new Date(lastDayOfMonth);
  lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + (6 - lastDayOfMonth.getDay()));

  // Generate calendar days
  const calendarDays = [];
  const currentDay = new Date(firstDayOfCalendar);
  while (currentDay <= lastDayOfCalendar) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Fetch events for the current month
  useEffect(() => {
    if (!babyId || !user?.id) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const startDate = firstDayOfCalendar.toISOString().split('T')[0];
        const endDate = lastDayOfCalendar.toISOString().split('T')[0];

        // Fetch all event types including activities
        const eventTypes: ActivityType[] = ['bottle', 'meal', 'breast', 'pump', 'diaper', 'bath', 'weight', 'measure', 'activity'];
        const allEvents: CalendarEvent[] = [];

        for (const eventType of eventTypes) {
          const config = activityConfig[eventType];
          const dateColumn = config.dateColumn;
          
          const { data, error } = await supabase
            .from(config.table)
            .select('*')
            .eq('baby_id', babyId)
            .eq('user_id', user.id)
            .gte(dateColumn, startDate)
            .lte(dateColumn, endDate);

          if (error) {
            console.error(`Error fetching ${eventType}:`, error);
            continue;
          }

          const typedEvents: CalendarEvent[] = (data || []).map(item => ({
            id: item.id,
            type: eventType,
            date: item[dateColumn],
            datetime: item[dateColumn], // Store the full datetime for datetime events
            title: config.title,
            description: item.comment || item.description
          }));

          allEvents.push(...typedEvents);
        }

        console.log('All events fetched:', allEvents);
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [babyId, user?.id, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      // For date-only events (like activities, baths)
      if (event.date === dateStr) {
        return true;
      }
      
      // For datetime events, check if the datetime falls within this day
      if (event.datetime) {
        const eventDate = new Date(event.datetime);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        return eventDateStr === dateStr;
      }
      
      return false;
    });
  };

  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDay(date);
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      setShowDetails(true);
    }
  };

  const getEventsByTypeForSelectedDay = () => {
    if (!selectedDate) return {};
    
    const dayEvents = getEventsForDay(selectedDate);
    const eventsByType: { [key in ActivityType]: CalendarEvent[] } = {} as any;
    
    // Initialize all types with empty arrays
    Object.keys(activityConfig).forEach(type => {
      eventsByType[type as ActivityType] = [];
    });
    
    // Group events by type
    dayEvents.forEach(event => {
      if (!eventsByType[event.type]) {
        eventsByType[event.type] = [];
      }
      eventsByType[event.type].push(event);
    });
    
    return eventsByType;
  };

  const getEventsByTypeForDay = (date: Date) => {
    const dayEvents = getEventsForDay(date);
    const eventsByType: { [key in ActivityType]: number } = {} as any;
    
    // Initialize all types with 0
    Object.keys(activityConfig).forEach(type => {
      eventsByType[type as ActivityType] = 0;
    });
    
    // Count events by type
    dayEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });
    
    // Debug logging
    if (dayEvents.length > 0) {
      console.log(`Events for ${date.toISOString().split('T')[0]}:`, dayEvents);
      console.log('Events by type:', eventsByType);
    }
    
    return eventsByType;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const eventsByType = getEventsByTypeForDay(date);
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDay = isToday(date);

          return (
            <div
              key={index}
              className={`
                h-16 p-1 border rounded-lg transition-colors relative cursor-pointer
                ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                ${isTodayDay ? 'ring-2 ring-blue-500' : ''}
                ${dayEvents.length > 0 ? 'border-blue-200 hover:border-blue-300' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => handleDayClick(date)}
            >
              <div className={`
                text-xs font-medium mb-1
                ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
                ${isTodayDay ? 'text-blue-600' : ''}
              `}>
                {date.getDate()}
              </div>
              
              {/* Colored horizontal lines for each event type */}
              <div className="space-y-0.5">
                {Object.entries(eventsByType).map(([type, count]) => {
                  if (count === 0) return null;
                  
                  const config = activityConfig[type as ActivityType];
                  
                  // Map color names to actual hex colors
                  const colorMap: { [key: string]: string } = {
                    'bg-blue-500': '#3b82f6',
                    'bg-green-500': '#10b981',
                    'bg-pink-500': '#ec4899',
                    'bg-purple-500': '#8b5cf6',
                    'bg-yellow-500': '#eab308',
                    'bg-cyan-500': '#06b6d4',
                    'bg-orange-500': '#f97316',
                    'bg-indigo-500': '#6366f1',
                    'bg-emerald-500': '#10b981'
                  };
                  
                  // Extract just the background color and convert to darker shade
                  const bgColor = config.color.split(' ')[0]; // Get first part (bg-blue-50)
                  const darkerColor = bgColor.replace('-50', '-500'); // Convert to bg-blue-500
                  const hexColor = colorMap[darkerColor] || '#6b7280'; // Default gray if not found
                  
                  console.log(`Rendering line for ${type}: count=${count}, color=${darkerColor}, hex=${hexColor}`);
                  
                  return (
                    <div
                      key={type}
                      className="h-1 rounded-full w-full"
                      style={{ backgroundColor: hexColor }}
                      title={`${config.title}: ${count} événement${count > 1 ? 's' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Légende</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(activityConfig).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`
                  w-4 h-4 rounded flex items-center justify-center
                  ${config.color}
                `}>
                  <IconComponent size={10} className={config.textColor} />
                </div>
                <span className="text-xs text-gray-600">{config.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {showDetails && selectedDate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {(() => {
                const eventsByType = getEventsByTypeForSelectedDay();
                const hasEvents = Object.values(eventsByType).some((events: unknown) => (events as CalendarEvent[]).length > 0);
                
                if (!hasEvents) {
                  return (
                    <p className="text-gray-500 text-center py-4">
                      Aucun événement enregistré ce jour
                    </p>
                  );
                }

                return Object.entries(eventsByType).map(([type, typeEvents]) => {
                  const events = typeEvents as CalendarEvent[];
                  if (events.length === 0) return null;
                  
                  const config = activityConfig[type as ActivityType];
                  const IconComponent = config.icon;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center
                          ${config.color}
                        `}>
                          <IconComponent size={14} className={config.textColor} />
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {config.title} ({events.length})
                        </h4>
                      </div>
                      
                      <div className="space-y-1 ml-8">
                        {events.map((event) => (
                          <div key={event.id} className="text-sm text-gray-600">
                            {event.title && event.title !== config.title && (
                              <div className="font-medium">{event.title}</div>
                            )}
                            {event.description && (
                              <div className="text-xs text-gray-500">{event.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
