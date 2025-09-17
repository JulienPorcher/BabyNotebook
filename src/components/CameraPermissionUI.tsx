import React from 'react';
import { type CameraPermissionState } from '../services/cameraAuthService';

interface CameraPermissionUIProps {
  permission: CameraPermissionState;
  isRetrying: boolean;
  error: string | null;
  onRequestPermission: () => void;
  onRetry: () => void;
}

export function CameraPermissionChecking() {
  return (
    <div className="space-y-4 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="text-gray-600">Vérification des permissions caméra...</p>
    </div>
  );
}

export function CameraPermissionUnsupported() {
  return (
    <div className="space-y-4 text-center">
      <div className="text-red-500 text-4xl mb-2">📷</div>
      <h3 className="text-lg font-semibold text-gray-800">Caméra non supportée</h3>
      <p className="text-gray-600 text-sm">
        Votre appareil ou navigateur ne supporte pas l'accès à la caméra.
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
        <p className="font-medium text-yellow-800 mb-1">Alternative :</p>
        <p className="text-yellow-700">
          Vous pouvez demander à la personne de vous envoyer le QR code par email ou de vous le montrer sur un autre appareil.
        </p>
      </div>
    </div>
  );
}

export function CameraPermissionDenied({ 
  isRetrying, 
  error, 
  onRequestPermission, 
  onRetry 
}: {
  isRetrying: boolean;
  error: string | null;
  onRequestPermission: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="text-red-500 text-4xl mb-2">🚫</div>
      <h3 className="text-lg font-semibold text-gray-800">Accès à la caméra refusé</h3>
      <p className="text-gray-600 text-sm mb-4">
        L'accès à la caméra est nécessaire pour scanner les QR codes.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-left">
        <p className="font-medium text-blue-800 mb-2">Pour autoriser l'accès :</p>
        <ol className="text-blue-700 space-y-1 list-decimal list-inside">
          <li>Cliquez sur l'icône de caméra dans la barre d'adresse</li>
          <li>Sélectionnez "Autoriser" ou "Allow"</li>
          <li>Actualisez la page</li>
        </ol>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRequestPermission}
          disabled={isRetrying}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRetrying ? 'Vérification...' : 'Réessayer'}
        </button>
        <button
          onClick={onRetry}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
        >
          Actualiser
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

export function CameraPermissionPrompt({ 
  isRetrying, 
  error, 
  onRequestPermission 
}: {
  isRetrying: boolean;
  error: string | null;
  onRequestPermission: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="text-blue-500 text-4xl mb-2">📷</div>
      <h3 className="text-lg font-semibold text-gray-800">Autoriser l'accès à la caméra</h3>
      <p className="text-gray-600 text-sm mb-4">
        Nous avons besoin d'accéder à votre caméra pour scanner les QR codes.
      </p>
      
      <button
        onClick={onRequestPermission}
        disabled={isRetrying}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isRetrying ? 'Demande d\'autorisation...' : 'Autoriser la caméra'}
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-left">
        <p className="font-medium text-gray-800 mb-1">Instructions :</p>
        <p className="text-gray-600">
          Cliquez sur "Autoriser" quand votre navigateur vous le demande.
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

export function CameraPermissionGranted({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
        <p className="text-green-800 font-medium">✅ Caméra autorisée</p>
        <p className="text-green-700">Pointez la caméra vers le QR code à scanner</p>
      </div>
      {children}
    </div>
  );
}

export default function CameraPermissionUI({
  permission,
  isRetrying,
  error,
  onRequestPermission,
  onRetry
}: CameraPermissionUIProps) {
  switch (permission) {
    case 'checking':
      return <CameraPermissionChecking />;
    
    case 'unsupported':
      return <CameraPermissionUnsupported />;
    
    case 'denied':
      return (
        <CameraPermissionDenied
          isRetrying={isRetrying}
          error={error}
          onRequestPermission={onRequestPermission}
          onRetry={onRetry}
        />
      );
    
    case 'prompt':
      return (
        <CameraPermissionPrompt
          isRetrying={isRetrying}
          error={error}
          onRequestPermission={onRequestPermission}
        />
      );
    
    case 'granted':
      return <CameraPermissionGranted>{null}</CameraPermissionGranted>;
    
    default:
      return <CameraPermissionChecking />;
  }
}
