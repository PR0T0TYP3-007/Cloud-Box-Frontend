import { API_BASE_URL } from './api';

export interface FileMetadata {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  updatedAt: string;
  isImage: boolean;
  isText: boolean;
  isPdf: boolean;
  isVideo: boolean;
  isAudio: boolean;
  width?: number;
  height?: number;
  format?: string;
}

export const previewService = {
  getThumbnailUrl(fileId: string): string {
    return `${API_BASE_URL}/files/${fileId}/thumbnail`;
  },

  getPreviewUrl(fileId: string): string {
    return `${API_BASE_URL}/files/${fileId}/preview`;
  },

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/metadata`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch file metadata');
    }

    const result = await response.json();
    return result.data;
  },

  canPreview(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop() || '';
    const previewableExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
      'txt', 'md', 'json', 'xml', 'csv', 'log',
      'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'html',
      'pdf', 'mp4', 'webm', 'mp3', 'wav'
    ];
    return previewableExtensions.includes(ext);
  },

  getFileIcon(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return '🖼️';
    }
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) {
      return '🎥';
    }
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
      return '🎵';
    }
    if (ext === 'pdf') {
      return '📄';
    }
    if (['txt', 'md', 'log'].includes(ext)) {
      return '📝';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return '📦';
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(ext)) {
      return '💻';
    }
    return '📁';
  },
};
