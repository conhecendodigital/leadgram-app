// Types for database management and statistics

export interface DatabaseStats {
  totalUsers: number;
  totalIdeas: number;
  totalNotifications: number;
  databaseSize: string; // Ex: "45.2 MB"
  spaceUsed: number; // Percentual
}

export interface CleanupStats {
  oldNotifications: number;
  oldLogs: number;
  expiredSessions: number;
  oldCache: number;
}
