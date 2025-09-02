import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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
      // Redirect to main page after successful login
      navigate("/");
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

      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
        Se connecter
      </button>

      <button
        type="button"
        onClick={() => navigate("/forgot-password")}
        className="w-full text-blue-500 text-sm hover:underline"
      >
        Mot de passe oublié ?
      </button>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}
