/**
 * WhatsApp-like Media Delivery System
 * 
 * This service implements a sophisticated media delivery system that:
 * 1. Generates low-resolution thumbnails for fast preview
 * 2. Downloads full-quality images only on demand
 * 3. Implements intelligent caching with encryption
 * 4. Manages bandwidth efficiently with progressive loading
 * 5. Provides secure media access with signed URLs
 */

import { supabase } from '../lib/supabaseClient';

// Media quality levels
export const MediaQuality = {
  THUMBNAIL: 'thumbnail',     // 150x150px, ~5-15KB
  PREVIEW: 'preview',         // 300x300px, ~20-50KB
  MEDIUM: 'medium',           // 800x800px, ~100-300KB
  FULL: 'full'                // Original resolution, ~1-10MB
} as const;

export type MediaQuality = typeof MediaQuality[keyof typeof MediaQuality];

// Cache configuration
export interface CacheConfig {
  maxSize: number;           // Maximum cache size in MB
  maxAge: number;            // Cache expiration time in hours
  compressionLevel: number;  // Image compression level (1-10)
}

// Media metadata
export interface MediaMetadata {
  id: string;
  path: string;
  thumbnail_path?: string;
  preview_path?: string;
  medium_path?: string;
  file_size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  mime_type?: string;
  checksum?: string;
  encrypted?: boolean;
  created_at: string;
  last_accessed?: string;
}

// Cache entry
interface CacheEntry {
  url: string;
  quality: MediaQuality;
  timestamp: number;
  size: number;
  encrypted: boolean;
}

class MediaDeliveryService {
  private cache = new Map<string, CacheEntry>();
  private cacheConfig: CacheConfig = {
    maxSize: 100, // 100MB
    maxAge: 24,   // 24 hours
    compressionLevel: 8
  };

  /**
   * Get media URL with intelligent quality selection
   */
  async getMediaUrl(
    mediaId: string, 
    quality: MediaQuality = MediaQuality.THUMBNAIL,
    forceRefresh: boolean = false
  ): Promise<string> {
    const cacheKey = `${mediaId}_${quality}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      
      // Check if cache entry is still valid
      if (this.isCacheValid(entry)) {
        this.updateAccessTime(mediaId);
        return entry.url;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    try {
      // Get media metadata
      const metadata = await this.getMediaMetadata(mediaId);
      if (!metadata) {
        throw new Error('Media not found');
      }

      // Generate appropriate URL based on quality
      const url = await this.generateMediaUrl(metadata, quality);
      
      // Cache the result
      this.cache.set(cacheKey, {
        url,
        quality,
        timestamp: Date.now(),
        size: this.estimateCacheSize(quality),
        encrypted: metadata.encrypted || false
      });

      // Cleanup cache if needed
      this.cleanupCache();
      
      return url;
    } catch (error) {
      console.error('Error getting media URL:', error);
      throw error;
    }
  }

  /**
   * Progressive loading: Start with thumbnail, upgrade to higher quality
   */
  async progressiveLoad(
    mediaId: string,
    onQualityLoaded: (url: string, quality: MediaQuality) => void
  ): Promise<void> {
    const qualities = [
      MediaQuality.THUMBNAIL,
      MediaQuality.PREVIEW,
      MediaQuality.MEDIUM,
      MediaQuality.FULL
    ];

    for (const quality of qualities) {
      try {
        const url = await this.getMediaUrl(mediaId, quality);
        onQualityLoaded(url, quality);
        
        // Add small delay between loads to prevent overwhelming the network
        if (quality !== MediaQuality.FULL) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error loading ${quality} quality:`, error);
        break;
      }
    }
  }

  /**
   * Preload media for better UX
   */
  async preloadMedia(mediaIds: string[], quality: MediaQuality = MediaQuality.THUMBNAIL): Promise<void> {
    const preloadPromises = mediaIds.map(async (mediaId) => {
      try {
        await this.getMediaUrl(mediaId, quality);
      } catch (error) {
        console.warn(`Failed to preload media ${mediaId}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Generate thumbnail for uploaded media
   */
  async generateThumbnails(originalPath: string): Promise<{
    thumbnailPath: string;
    previewPath: string;
    mediumPath: string;
  }> {
    try {
      // This would typically call a serverless function or image processing service
      const response = await fetch('/api/generate-thumbnails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPath,
          qualities: [
            { quality: MediaQuality.THUMBNAIL, size: 150 },
            { quality: MediaQuality.PREVIEW, size: 300 },
            { quality: MediaQuality.MEDIUM, size: 800 }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate thumbnails');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      throw error;
    }
  }

  /**
   * Encrypt media file
   */
  async encryptMedia(file: File, encryptionKey: string): Promise<{
    encryptedFile: File;
    iv: string;
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(encryptionKey),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        arrayBuffer
      );

      const encryptedFile = new File(
        [encryptedData],
        file.name,
        { type: file.type }
      );

      return {
        encryptedFile,
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
      };
    } catch (error) {
      console.error('Error encrypting media:', error);
      throw error;
    }
  }

  /**
   * Decrypt media file
   */
  async decryptMedia(encryptedData: ArrayBuffer, iv: string, encryptionKey: string): Promise<ArrayBuffer> {
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(encryptionKey),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const ivArray = new Uint8Array(
        iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      return await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivArray },
        key,
        encryptedData
      );
    } catch (error) {
      console.error('Error decrypting media:', error);
      throw error;
    }
  }

  /**
   * Get bandwidth-optimized media URL based on connection speed
   */
  async getOptimizedMediaUrl(
    mediaId: string,
    connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium'
  ): Promise<string> {
    let quality: MediaQuality;
    
    switch (connectionSpeed) {
      case 'slow':
        quality = MediaQuality.THUMBNAIL;
        break;
      case 'medium':
        quality = MediaQuality.PREVIEW;
        break;
      case 'fast':
        quality = MediaQuality.MEDIUM;
        break;
    }

    return this.getMediaUrl(mediaId, quality);
  }

  /**
   * Clear cache for specific media or all cache
   */
  clearCache(mediaId?: string): void {
    if (mediaId) {
      // Clear all qualities for specific media
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.startsWith(`${mediaId}_`)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: number;
    hitRate: number;
  } {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    return {
      size: totalSize,
      entries: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for accurate calculation
    };
  }

  // Private methods

  private async getMediaMetadata(mediaId: string): Promise<MediaMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('id', mediaId)
        .single();

      if (error) throw error;
      return data as MediaMetadata;
    } catch (error) {
      console.error('Error getting media metadata:', error);
      return null;
    }
  }

  private async generateMediaUrl(metadata: MediaMetadata, quality: MediaQuality): Promise<string> {
    let path: string;
    
    switch (quality) {
      case MediaQuality.THUMBNAIL:
        path = metadata.thumbnail_path || metadata.path;
        break;
      case MediaQuality.PREVIEW:
        path = metadata.preview_path || metadata.path;
        break;
      case MediaQuality.MEDIUM:
        path = metadata.medium_path || metadata.path;
        break;
      case MediaQuality.FULL:
        path = metadata.path;
        break;
      default:
        path = metadata.path;
    }

    // Ensure path is not undefined or empty
    if (!path) {
      throw new Error(`No path available for quality ${quality}`);
    }

    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    const maxAgeMs = this.cacheConfig.maxAge * 60 * 60 * 1000;
    return age < maxAgeMs;
  }

  private updateAccessTime(mediaId: string): void {
    // Update last accessed time in database
    supabase
      .from('photos')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', mediaId)
      .then(({ error }) => {
        if (error) console.error('Error updating access time:', error);
      });
  }

  private estimateCacheSize(quality: MediaQuality): number {
    // Estimate cache size in KB based on quality
    switch (quality) {
      case MediaQuality.THUMBNAIL: return 10;
      case MediaQuality.PREVIEW: return 30;
      case MediaQuality.MEDIUM: return 200;
      case MediaQuality.FULL: return 2000;
      default: return 100;
    }
  }

  private cleanupCache(): void {
    const maxSizeKB = this.cacheConfig.maxSize * 1024;
    const currentSizeKB = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    if (currentSizeKB > maxSizeKB) {
      // Remove oldest entries first
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      let sizeToRemove = currentSizeKB - maxSizeKB;
      for (const [key, entry] of entries) {
        if (sizeToRemove <= 0) break;
        this.cache.delete(key);
        sizeToRemove -= entry.size;
      }
    }
  }
}

// Export singleton instance
export const mediaDeliveryService = new MediaDeliveryService();
export default mediaDeliveryService;
