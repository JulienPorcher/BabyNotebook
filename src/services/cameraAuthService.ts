export type CameraPermissionState = 'checking' | 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface CameraPermissionResult {
  permission: CameraPermissionState;
  error: string | null;
}

export interface CameraAuthService {
  checkPermission: () => Promise<CameraPermissionResult>;
  requestPermission: () => Promise<CameraPermissionResult>;
  isSupported: () => boolean;
}

class CameraAuthServiceImpl implements CameraAuthService {
  private isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async checkPermission(): Promise<CameraPermissionResult> {
    try {
      if (!this.isSupported()) {
        return {
          permission: 'unsupported',
          error: 'Votre appareil ou navigateur ne supporte pas l\'accès à la caméra.'
        };
      }

      // Check current permission status using Permissions API
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ 
            name: 'camera' as PermissionName 
          });
          
          const permission = permissionStatus.state === 'granted' ? 'granted' : 
                           permissionStatus.state === 'denied' ? 'denied' : 'prompt';
          
          return { permission, error: null };
        } catch (err) {
          // Fallback if permissions API is not fully supported
          return { permission: 'prompt', error: null };
        }
      } else {
        // Fallback for browsers without Permissions API
        return { permission: 'prompt', error: null };
      }
    } catch (err) {
      console.error('Error checking camera permission:', err);
      return { 
        permission: 'prompt', 
        error: 'Erreur lors de la vérification des permissions caméra.' 
      };
    }
  }

  async requestPermission(): Promise<CameraPermissionResult> {
    try {
      if (!this.isSupported()) {
        return {
          permission: 'unsupported',
          error: 'Votre appareil ou navigateur ne supporte pas l\'accès à la caméra.'
        };
      }

      // Try to access camera to trigger permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately as we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      
      return { permission: 'granted', error: null };
    } catch (err: any) {
      console.error('Camera access error:', err);
      
      const errorMessage = this.getErrorMessage(err);
      const permission = this.getPermissionFromError(err);
      
      return { permission, error: errorMessage };
    }
  }

  private getErrorMessage(err: any): string {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.';
      
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'Aucune caméra trouvée sur cet appareil.';
      
      case 'NotReadableError':
        return 'La caméra est déjà utilisée par une autre application.';
      
      case 'OverconstrainedError':
        return 'Les paramètres de la caméra ne sont pas supportés par cet appareil.';
      
      case 'SecurityError':
        return 'L\'accès à la caméra est bloqué pour des raisons de sécurité. Assurez-vous d\'utiliser HTTPS.';
      
      case 'AbortError':
        return 'La demande d\'accès à la caméra a été annulée.';
      
      default:
        return 'Erreur lors de l\'accès à la caméra. Veuillez réessayer.';
    }
  }

  private getPermissionFromError(err: any): CameraPermissionState {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
      case 'NotReadableError':
        return 'denied';
      
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'unsupported';
      
      default:
        return 'denied';
    }
  }

  isSupported(): boolean {
    return this.isSupported();
  }
}

// Export singleton instance
export const cameraAuthService = new CameraAuthServiceImpl();

// Export types for convenience
export type { CameraPermissionState, CameraPermissionResult };
