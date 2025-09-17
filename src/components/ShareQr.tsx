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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/share/create-qr-share`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ babyId })
      });
      
      if (!res.ok) {
        let errorMessage = "Erreur lors de la génération du QR code";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, get the text content
          const textContent = await res.text();
          errorMessage = textContent || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const responseText = await res.text();
      if (!responseText) {
        throw new Error("Réponse vide du serveur");
      }
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`Réponse invalide du serveur: ${responseText}`);
      }
      
      const { token } = responseData;
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
