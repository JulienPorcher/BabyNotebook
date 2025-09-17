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
      // Generate a simple UUID token for now
      const token = crypto.randomUUID();
      
      // Store in database for validation
      const { error } = await supabase
        .from('baby_share_tokens')
        .insert({
          token: token,
          baby_id: babyId,
          owner_id: (await supabase.auth.getUser()).data.user?.id,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
        });
      
      if (error) {
        throw new Error(error.message || "Erreur lors de la génération du QR code");
      }
      
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={generateQr}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Génération..." : "Partager via QR Code"}
      </button>
      
      {error && (
        <p className="text-red-500 text-center text-sm">{error}</p>
      )}
      
      {token && (
        <div className="flex flex-col items-center space-y-2">
          <QRCodeCanvas value={token} size={200} />
          <p className="text-sm text-gray-600 text-center">
            Ce QR code expire dans 5 minutes
          </p>
        </div>
      )}
    </div>
  );
}
