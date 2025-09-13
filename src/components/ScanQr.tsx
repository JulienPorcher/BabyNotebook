import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "../lib/supabaseClient";

export default function ScanQr({ onSuccess }: { onSuccess?: () => void }) {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleScan = async (data: string | null) => {
    if (!data) return;

    setStatus("Traitement du QR code...");
    setError("");

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch("/functions/v1/share/accept-share", {
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
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("");
    }
  };

  return (
    <div className="space-y-4">
      <Scanner
        onScan={(detectedCodes) => {
          if (detectedCodes.length > 0) {
            handleScan(detectedCodes[0].rawValue);
          }
        }}
        onError={(error: unknown) => console.error(error)}
      />
      
      {status && (
        <p className="text-green-600 text-center">{status}</p>
      )}
      
      {error && (
        <p className="text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
