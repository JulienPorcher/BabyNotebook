import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ShareEmail({ babyId }: { babyId: string }) {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const sendEmail = async () => {
    if (!email.trim()) {
      setError("Veuillez entrer une adresse email");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch("/functions/v1/share/create-email-share", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ babyId, email })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi de l'email");
      }

      setStatus("Email envoyé avec succès !");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <button 
        onClick={sendEmail}
        disabled={loading || !email.trim()}
        className="bg-green-500 text-white rounded-xl px-4 py-2 disabled:opacity-50 w-full"
      >
        {loading ? "Envoi..." : "Partager par email"}
      </button>
      
      {status && (
        <p className="text-green-600 text-sm">{status}</p>
      )}
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
