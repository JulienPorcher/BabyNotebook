import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "../lib/supabaseClient";
import { useCameraPermission } from "../hooks/useCameraPermission";
import CameraPermissionUI from "./CameraPermissionUI";

export default function ScanQr({ onSuccess }: { onSuccess?: () => void }) {
  const [status, setStatus] = useState<string>("");
  const [scanError, setScanError] = useState<string>("");
  const { permission, isRetrying, requestPermission, error } = useCameraPermission();

  const handleScan = async (data: string | null) => {
    if (!data) return;

    setStatus("Traitement du QR code...");
    setScanError("");

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/share/accept-share`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: data, type: "qr" })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'acceptation du partage");
      }

      const result = await res.json();
      setStatus(result.message || "Carnet partagé avec succès !");
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("");
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // If camera permission is not granted, show permission UI
  if (permission !== 'granted') {
    return (
      <CameraPermissionUI
        permission={permission}
        isRetrying={isRetrying}
        error={error}
        onRequestPermission={requestPermission}
        onRetry={handleRetry}
      />
    );
  }

  // Camera permission granted - show scanner
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
        <p className="text-green-800 font-medium">✅ Caméra autorisée</p>
        <p className="text-green-700">Pointez la caméra vers le QR code à scanner</p>
      </div>
      
      <div className="relative">
        <Scanner
          onScan={(detectedCodes) => {
            if (detectedCodes.length > 0) {
              handleScan(detectedCodes[0].rawValue);
            }
          }}
          onError={(error: unknown) => {
            console.error('Scanner error:', error);
            setScanError('Erreur du scanner. Veuillez réessayer.');
          }}
        />
        
        {/* Scanner overlay with targeting frame */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-48 h-48 border-2 border-white rounded-lg shadow-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>
        </div>
      </div>
      
      {status && (
        <p className="text-green-600 text-center font-medium">{status}</p>
      )}
      
      {scanError && (
        <p className="text-red-500 text-center text-sm">{scanError}</p>
      )}
    </div>
  );
}
