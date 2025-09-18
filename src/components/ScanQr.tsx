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
      // Look up the token in the database
      const { data: tokenData, error: tokenError } = await supabase
        .from('baby_share_tokens')
        .select('baby_id, owner_id, expires_at')
        .eq('token', data)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        throw new Error("QR code invalide ou expiré");
      }

      // Check if token is expired (UTC times)
      const now = new Date();
      // Parse expires_at as UTC explicitly
      const expiresAt = new Date(tokenData.expires_at + 'Z');
      
      console.log('Token expiration check:');
      console.log('Current time (UTC):', now.toISOString());
      console.log('Expires at (UTC):', expiresAt.toISOString());
      console.log('Time difference (minutes):', (expiresAt.getTime() - now.getTime()) / (1000 * 60));
      
      // Add a small buffer (30 seconds) to account for any timing differences
      const bufferMs = 30 * 1000; // 30 seconds
      if (expiresAt.getTime() <= (now.getTime() + bufferMs)) {
        throw new Error("QR code expiré");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Check if user is already sharing this baby
      const { data: existingShare } = await supabase
        .from('baby_shares')
        .select('id')
        .eq('baby_id', tokenData.baby_id)
        .eq('user_id', user.id)
        .single();

      if (existingShare) {
        setStatus("Carnet déjà partagé avec vous !");
        return;
      }

      // Get baby name
      const { data: baby } = await supabase
        .from('babies')
        .select('name')
        .eq('id', tokenData.baby_id)
        .single();

      // Create baby_shares entry
      const { error: shareError } = await supabase
        .from('baby_shares')
        .insert({
          baby_id: tokenData.baby_id,
          user_id: user.id,
          role: 'invited',
          nickname: baby?.name || 'Baby'
        });

      if (shareError) {
        console.error('Share error:', shareError);
        throw new Error(`Erreur lors de l'ajout du partage: ${shareError.message}`);
      }

      // Mark token as used
      await supabase
        .from('baby_share_tokens')
        .update({ used: true })
        .eq('token', data);

      setStatus("Carnet partagé avec succès !");
      
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
      
      {/* Manual trigger for mobile devices */}
      <button
        onClick={requestPermission}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 text-sm"
      >
        🔄 Réinitialiser la caméra
      </button>
      
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
          constraints={{
            facingMode: 'environment'
          } as MediaTrackConstraints}
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
