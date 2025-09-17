import { useState, useEffect, useCallback } from 'react';
import { cameraAuthService, CameraPermissionState, CameraPermissionResult } from '../services/cameraAuthService';

export interface CameraPermissionHook {
  permission: CameraPermissionState;
  isRetrying: boolean;
  requestPermission: () => Promise<void>;
  checkPermission: () => Promise<void>;
  error: string | null;
}

export function useCameraPermission(): CameraPermissionHook {
  const [permission, setPermission] = useState<CameraPermissionState>('checking');
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async () => {
    setError(null);
    const result = await cameraAuthService.checkPermission();
    setPermission(result.permission);
    setError(result.error);
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    
    const result = await cameraAuthService.requestPermission();
    setPermission(result.permission);
    setError(result.error);
    
    setIsRetrying(false);
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permission,
    isRetrying,
    requestPermission,
    checkPermission,
    error
  };
}
