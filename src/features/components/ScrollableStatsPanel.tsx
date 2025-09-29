import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useBaby } from "../../context/BabyContext";
import { useAuth } from "../../hooks/useAuth";
import { activityConfig, getActivitiesByCategory, type ActivityType } from "../../lib/activityConfig";
import { getRelativeTimeString } from "../../lib/timeUtils";

// Types
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
  frequency?: number; // Usage frequency score
  hasData: boolean; // Whether panel has any data
};

type PanelData = {
  logs: LogEntry[];
  stats: PanelStats;
  loading: boolean;
};

type TabType = 'meal' | 'hygiene' | 'health';

type ScrollableStatsPanelProps = {
  tab?: TabType;
};

export default function ScrollableStatsPanel({ tab }: ScrollableStatsPanelProps) {
  const { currentBabyId } = useBaby();
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [panelData, setPanelData] = useState<Record<ActivityType, PanelData>>({
    bottle: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    meal: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    breast: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    pump: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    diaper: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    bath: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    weight: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    measure: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true },
    activity: { logs: [], stats: { todayCount: 0, todayTotal: 0, weekAverage: 0, hasData: false }, loading: true }
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

  // Calculate usage frequency based on datetime difference and number of rows
  // Used for panel ordering (not displayed to user)
  const calculateFrequency = (logs: LogEntry[]): number => {
    if (logs.length === 0) return 0;
    if (logs.length === 1) {
      // For single entry, calculate frequency using today's date
      const entryDate = new Date(logs[0].date);
      const today = new Date();
      const timeDiffMs = today.getTime() - entryDate.getTime();
      const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
      return timeDiffDays > 0 ? 1 / timeDiffDays : 1;
    }
    
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = new Date(sortedLogs[0].date);
    const lastDate = new Date(sortedLogs[sortedLogs.length - 1].date);
    
    const timeDiffMs = lastDate.getTime() - firstDate.getTime();
    const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
    
    // Frequency = number of entries per day
    return timeDiffDays > 0 ? logs.length / timeDiffDays : logs.length;
  };

  // Determine which panels to show based on tab
  const getPanelTypesForTab = (tab?: TabType): ActivityType[] => {
    switch (tab) {
      case 'meal':
        return getActivitiesByCategory('meal');
      case 'hygiene':
        return getActivitiesByCategory('hygiene');
      case 'health':
        return getActivitiesByCategory('health');
      default:
        return Object.keys(activityConfig) as ActivityType[];
    }
  };

  // Fetch data for all panels
  useEffect(() => {
    if (!user?.id || !currentBabyId) return;

    const fetchAllData = async () => {
      const panelTypes = getPanelTypesForTab(tab);
      
      for (const panelType of panelTypes) {
        const config = activityConfig[panelType];
        
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

        const lastEntry = logs?.[0] ? logs[0][dateField] : undefined;
        const hasData = (logs?.length || 0) > 0;
        const frequency = hasData ? calculateFrequency(logs || []) : 0;

        setPanelData(prev => ({
          ...prev,
          [panelType]: {
            logs: logs || [],
            stats: {
              todayCount,
              todayTotal,
              weekAverage: Math.round(weekAverage * 10) / 10,
              lastEntry,
              frequency,
              hasData
            },
            loading: false
          }
        }));
      }
    };

    fetchAllData();
  }, [currentBabyId, user?.id, refreshTrigger, tab]);

  const panelTypes = getPanelTypesForTab(tab);

  // Filter panels with data and sort by frequency (highest first)
  const visiblePanels = panelTypes
    .filter(panelType => panelType && panelData[panelType] && panelData[panelType].stats.hasData)
    .sort((a, b) => (panelData[b].stats.frequency || 0) - (panelData[a].stats.frequency || 0));

  return (
    <div className="w-full space-y-4">
      {visiblePanels.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune donnée disponible pour cette catégorie.</p>
          <p className="text-sm mt-1">Ajoutez des entrées pour voir les statistiques.</p>
        </div>
      ) : (
        visiblePanels.map((panelType) => {
        const config = activityConfig[panelType];
        const data = panelData[panelType];
        const dateField = config.dateColumn === "date" ? "date" : "date_time";
        
        return (
          <div
            key={panelType}
            className="w-full"
          >
              <div className={`rounded-xl border-2 p-4 ${config.color}`}>
                {/* Panel header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <config.icon className="w-6 h-6" />
                    <h3 className={`text-lg font-semibold ${config.textColor}`}>
                      {config.title}
                    </h3>
                  </div>
                  {data.stats.lastEntry && (
                    <div className={`text-xs px-2 py-1 rounded-full ${config.textColor} bg-white/50`}>
                      Il y a {getRelativeTimeString(data.stats.lastEntry)}
                    </div>
                  )}
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
        })
      )}
    </div>
  );
}
