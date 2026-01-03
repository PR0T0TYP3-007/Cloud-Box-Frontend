import { API_BASE_URL } from './api';

export interface ActivityLog {
  id: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  resourceName: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityResponse {
  logs: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

export const activityService = {
  async getActivity(limit: number = 50, offset: number = 0): Promise<ActivityResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/activity?limit=${limit}&offset=${offset}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Activity fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch activity: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return result.data || { logs: [], total: 0, limit, offset };
    } catch (error) {
      console.error('Activity service error:', error);
      throw error;
    }
  },

  async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/activity/recent?limit=${limit}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Recent activity fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch recent activity: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Recent activity service error:', error);
      throw error;
    }
  },
};
