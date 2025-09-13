import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabaseClient";

export default function ShareQr({ babyId }: { babyId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQr = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch("/functions/v1/share/create-qr-share", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ babyId })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la génération du QR code");
      }
      
      const { token } = await res.json();
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={generateQr}
        disabled={loading}
        className="bg-blue-500 text-white rounded-xl px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Génération..." : "Partager par QR"}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {token && (
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-gray-600">QR Code valide 5 minutes</p>
          <QRCodeCanvas value={token} size={200} />
        </div>
      )}
    </div>
  );
}
