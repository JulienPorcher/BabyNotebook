import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } else {
      setMessage("✅ Connexion réussie !");
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 p-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-bold">Se connecter</h2>

      <input
        type="email"
        placeholder="Adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
        required
      />

      <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg">
        Connexion
      </button>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}
