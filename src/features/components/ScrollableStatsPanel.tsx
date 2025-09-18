import { useEffect, useState, useRef } from "react";
import { Utensils, Heart, HeartPlus, Milk, Baby, Droplets } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useBaby } from "../../context/BabyContext";
import { useAuth } from "../../hooks/useAuth";

// Types
type LogType = 'bottle' | 'meal' | 'breast' | 'pump' | 'diaper' | 'bath';

type LogEntry = {
  id: string;
  date: string;
  date_time?: string;
  type: string;
  quantity?: number | string;
  comment?: string;
};

type PanelStats = {
  todayCount: number;
  todayTotal: number;
  weekAverage: number;
  lastEntry?: string;
};

type PanelData = {
  logs: LogEntry[];
  stats: PanelStats;
  loading: boolean;
};

const panelConfig = {
  bottle: {
    title: "Biberon",
    icon: <Milk className="w-6 h-6" />,
    table: "bottles",
    dateColumn: "date_time",
    unit: "ml",
    color: "bg-blue-50 border-blue-200",
    textColor: "text-blue-700"
  },
  meal: {
    title: "Solide",
    icon: <Utensils className="w-6 h-6" />,
    table: "meals",
    dateColumn: "date_time",
    unit: "g",
    color: "bg-green-50 border-green-200",
    textColor: "text-green-700"
  },
  breast: {
    title: "Allaitement",
    icon: <Heart className="w-6 h-6" />,
    table: "breast_feeding",
    dateColumn: "date_time",
    unit: "min",
    color: "bg-pink-50 border-pink-200",
    textColor: "text-pink-700"
  },
  pump: {
    title: "Expression",
    icon: <HeartPlus className="w-6 h-6" />,
    table: "pumps",
    dateColumn: "date_time",
    unit: "ml",
    color: "bg-purple-50 border-purple-200",
    textColor: "text-purple-700"
  },
  diaper: {
    title: "Couche",
    icon: <Baby className="w-6 h-6" />,
    table: "diapers",
    dateColumn: "date_time",
    unit: "",
    color: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-700"
  },
  bath: {
    title: "Bain",
    icon: <Droplets className="w-6 h-6" />,
    table: "baths",
    dateColumn: "date",
    unit: "",
    color: "bg-cyan-50 border-cyan-200",
    textColor: "text-cyan-700"
  }
} as const;

export default function ScrollableStatsPanel() {
  const { currentBabyId } = useBaby();
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [panelData, setPanelData] = useState<Record<LogType, PanelData>>({
    bottle: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0 }, loading: true },
    meal: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0 }, loading: true },
    breast: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0 }, loading: true },
    pump: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0 }, loading: true },
    diaper: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0 }, loading: true },
    bath: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0 }, loading: true }
  });

  // Listen for data refresh events
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('refreshStatsPanel', handleRefresh);
    return () => {
      window.removeEventListener('refreshStatsPanel', handleRefresh);
    };
  }, []);

  // Fetch data for all panels
  useEffect(() => {
    if (!user?.id || !currentBabyId) return;

    const fetchAllData = async () => {
      const panelTypes: LogType[] = ['bottle', 'meal', 'breast', 'pump', 'diaper', 'bath'];
      
      for (const panelType of panelTypes) {
        const config = panelConfig[panelType];
        
        // Fetch recent logs
        const { data: logs, error: logsError } = await supabase
          .from(config.table)
          .select("*")
          .eq("baby_id", currentBabyId)
          .eq("user_id", user.id)
          .order(config.dateColumn, { ascending: false })
          .limit(10);

        if (logsError) {
          console.error(`Error fetching ${panelType} logs:`, logsError);
          continue;
        }

        // Calculate stats
        const today = new Date().toDateString();
        const dateField = config.dateColumn === "date" ? "date" : "date_time";
        const todayLogs = logs?.filter(log => new Date(log[dateField]).toDateString() === today) || [];
        const weekLogs = logs?.filter(log => {
          const logDate = new Date(log[dateField]);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate >= weekAgo;
        }) || [];

        const todayCount = todayLogs.length;
        const todayTotal = todayLogs.reduce((sum, log) => {
          const qty = typeof log.quantity === 'number' ? log.quantity : 0;
          return sum + qty;
        }, 0);
        const weekAverage = weekLogs.length > 0 ? weekLogs.reduce((sum, log) => {
          const qty = typeof log.quantity === 'number' ? log.quantity : 0;
          return sum + qty;
        }, 0) / 7 : 0;

        const lastEntry = logs?.[0] ? new Date(logs[0][dateField]).toLocaleString() : undefined;

        setPanelData(prev => ({
          ...prev,
          [panelType]: {
            logs: logs || [],
            stats: {
              todayCount,
              todayTotal,
              weekAverage: Math.round(weekAverage * 10) / 10,
              lastEntry
            },
            loading: false
          }
        }));
      }
    };

    fetchAllData();
  }, [currentBabyId, user?.id, refreshTrigger]);

  // Handle scroll to update current panel
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const panelWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const newPanel = Math.round(scrollLeft / panelWidth);
    
    if (newPanel !== currentPanel) {
      setCurrentPanel(newPanel);
    }
  };

  // Scroll to specific panel
  const scrollToPanel = (panelIndex: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const panelWidth = container.clientWidth;
    container.scrollTo({
      left: panelIndex * panelWidth,
      behavior: 'smooth'
    });
  };

  const panelTypes: LogType[] = ['bottle', 'meal', 'breast', 'pump', 'diaper', 'bath'];

  return (
    <div className="w-full">
      {/* Navigation dots */}
      <div className="flex justify-center space-x-2 mb-4">
        {panelTypes.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToPanel(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentPanel === index ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Scrollable panels container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {panelTypes.map((panelType) => {
          const config = panelConfig[panelType];
          const data = panelData[panelType];
          const dateField = config.dateColumn === "date" ? "date" : "date_time";
          
          return (
            <div
              key={panelType}
              className="flex-shrink-0 w-full snap-center px-2"
            >
              <div className={`rounded-xl border-2 p-4 ${config.color}`}>
                {/* Panel header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {config.icon}
                    <h3 className={`text-lg font-semibold ${config.textColor}`}>
                      {config.title}
                    </h3>
                  </div>
                </div>

                {/* Stats section */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${config.textColor}`}>
                      {data.loading ? "..." : data.stats.todayCount}
                    </div>
                    <div className="text-xs text-gray-600">Aujourd'hui</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${config.textColor}`}>
                      {data.loading ? "..." : data.stats.todayTotal}
                    </div>
                    <div className="text-xs text-gray-600">
                      Total {config.unit}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${config.textColor}`}>
                      {data.loading ? "..." : data.stats.weekAverage}
                    </div>
                    <div className="text-xs text-gray-600">
                      Moy/jour {config.unit}
                    </div>
                  </div>
                </div>

                {/* Recent entries */}
                <div className="space-y-2">
                  <h4 className={`text-sm font-medium ${config.textColor} mb-2`}>
                    Dernières entrées
                  </h4>
                  
                  {data.loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
                    </div>
                  ) : data.logs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Aucune entrée récente
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {data.logs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="flex justify-between items-center text-xs bg-white/50 rounded p-2"
                        >
                          <div>
                            <div className="font-medium">
                              {/* Show date only (dd/mm/yyyy) for "date" column, date+time (dd/mm/yyyy hh:mm) for "date_time" column */}
                              {config.dateColumn === "date" 
                                ? new Date(log[dateField] || log.date).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })
                                : new Date(log[dateField] || log.date).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                              }
                            </div>
                            {log.comment && (
                              <div className="text-gray-600 truncate max-w-32">
                                {log.comment}
                              </div>
                            )}
                          </div>
                          <div className={`font-semibold ${config.textColor}`}>
                            {log.quantity ? `${log.quantity} ${config.unit}` : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
