import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { supabase } from "../lib/supabaseClient";

export default function ScanQr() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("");
    }
  };

  return (
    <div className="space-y-4">
      <QrReader onResult={(result: any) => handleScan(result?.getText() || null)} />
      
      {status && (
        <p className="text-green-600 text-center">{status}</p>
      )}
      
      {error && (
        <p className="text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
