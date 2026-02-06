/**
 * Native Camera Service for iOS/Android
 * Handles photo capture from native camera and image processing
 * Works OFFLINE - no internet required
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface ParchiImage {
  base64: string;
  width: number;
  height: number;
  format: string;
}

export interface ExtractedItem {
  productName: string;
  quantity: number;
  unit: string;
  price?: number;
  confidence: number;
}

export class NativeCameraService {
  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('[NativeCamera] Permission error:', error);
      return false;
    }
  }

  /**
   * Check camera permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('[NativeCamera] Check permission error:', error);
      return false;
    }
  }

  /**
   * Capture photo from native camera
   * Returns base64 for offline OCR processing
   */
  async captureParchi(): Promise<ParchiImage | null> {
    try {
      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Camera permission denied');
        }
      }

      // Open native camera
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        saveToGallery: false,
        correctOrientation: true,
        width: 1920, // High quality for OCR
        height: 1080,
      });

      if (!image.base64String) {
        throw new Error('Failed to capture image');
      }

      return {
        base64: image.base64String,
        width: 1920,
        height: 1080,
        format: image.format || 'jpeg',
      };
    } catch (error) {
      console.error('[NativeCamera] Capture error:', error);
      return null;
    }
  }

  /**
   * Pick image from gallery (fallback)
   */
  async pickFromGallery(): Promise<ParchiImage | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });

      if (!image.base64String) {
        throw new Error('Failed to load image');
      }

      return {
        base64: image.base64String,
        width: 1920,
        height: 1080,
        format: image.format || 'jpeg',
      };
    } catch (error) {
      console.error('[NativeCamera] Gallery error:', error);
      return null;
    }
  }

  /**
   * Preprocess image for better OCR
   * Converts to grayscale, enhances contrast
   */
  preprocessForOCR(base64Image: string): string {
    // In a real implementation, this would use canvas or native image processing
    // For now, return as-is - Tesseract.js handles preprocessing
    return base64Image;
  }
}

// Singleton instance
export const nativeCamera = new NativeCameraService();
