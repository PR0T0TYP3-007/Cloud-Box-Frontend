import { API_BASE_URL } from './api';

export interface BatchItem {
  id: string;
  type: 'file' | 'folder';
}

export interface BatchResult {
  successes: Array<{ id: string; type: string }>;
  errors: Array<{ id: string; type: string; error: string }>;
}

export const batchService = {
  async batchDelete(items: BatchItem[]): Promise<BatchResult> {
    const response = await fetch(`${API_BASE_URL}/files/batch/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to batch delete');
    }

    const result = await response.json();
    return result.data;
  },

  async batchMove(items: BatchItem[], targetFolderId: string | null): Promise<BatchResult> {
    const response = await fetch(`${API_BASE_URL}/files/batch/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ items, targetFolderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to batch move');
    }

    const result = await response.json();
    return result.data;
  },

  async batchRestore(items: BatchItem[]): Promise<BatchResult> {
    const response = await fetch(`${API_BASE_URL}/files/batch/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to batch restore');
    }

    const result = await response.json();
    return result.data;
  },
};
