'use client';

import { useEffect, useState } from 'react';
import { activityService, ActivityLog } from '@/services/activity.service';
import { formatDistanceToNow } from 'date-fns';

const actionLabels: Record<string, string> = {
  file_upload: 'Uploaded file',
  file_download: 'Downloaded file',
  file_delete: 'Deleted file',
  file_restore: 'Restored file',
  file_rename: 'Renamed file',
  file_move: 'Moved file',
  folder_create: 'Created folder',
  folder_delete: 'Deleted folder',
  folder_restore: 'Restored folder',
  folder_rename: 'Renamed folder',
  folder_move: 'Moved folder',
  share_create: 'Shared item',
  share_revoke: 'Revoked share',
  user_login: 'Logged in',
  user_logout: 'Logged out',
  user_signup: 'Signed up',
  batch_delete: 'Batch deleted items',
  batch_move: 'Batch moved items',
  batch_restore: 'Batch restored items',
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadActivity();
  }, [page]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const data = await activityService.getActivity(limit, page * limit);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('upload')) return '⬆️';
    if (action.includes('download')) return '⬇️';
    if (action.includes('delete')) return '🗑️';
    if (action.includes('restore')) return '♻️';
    if (action.includes('rename')) return '✏️';
    if (action.includes('move')) return '📦';
    if (action.includes('share')) return '🔗';
    if (action.includes('login') || action.includes('signup')) return '🔐';
    if (action.includes('logout')) return '🚪';
    return '📋';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Activity Log</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Activity Log</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No activity yet</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getActionIcon(log.action)}</div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {actionLabels[log.action] || log.action}
                      {log.resourceName && (
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {log.resourceName}
                        </span>
                      )}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {log.metadata.size && (
                          <span className="mr-3">
                            Size: {(log.metadata.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                        {log.metadata.count && (
                          <span className="mr-3">Items: {log.metadata.count}</span>
                        )}
                        {log.metadata.successes !== undefined && (
                          <span className="mr-3">
                            ✓ {log.metadata.successes} successful
                          </span>
                        )}
                        {log.metadata.errors > 0 && (
                          <span className="text-red-600">
                            ✗ {log.metadata.errors} failed
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of{' '}
              {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
