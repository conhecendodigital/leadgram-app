export interface DatabaseStats {
  totalUsers: number;
  totalIdeas: number;
  totalNotifications: number;
  databaseSize: string; // Ex: "45.2 MB"
  spaceUsed: number; // Percentual
}

export interface DatabaseBackup {
  id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
  status: 'completed' | 'failed' | 'processing';
  backup_type: 'manual' | 'automatic';
  created_by?: string;
}

export interface BackupConfig {
  id: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  day_of_week?: number;
  day_of_month?: number;
  last_run?: string;
  next_run?: string;
  updated_at: string;
}

export interface CleanupStats {
  oldNotifications: number;
  oldLogs: number;
  expiredSessions: number;
  oldCache: number;
}
