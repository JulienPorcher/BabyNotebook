import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export async function signInWithProvider(provider: 'google' | 'apple') {
  const { error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) throw error;
}

export async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } else {
      if (data.user?.identities?.length === 0) {
        setMessage("⚠️ Un compte existe déjà avec cette adresse.");
      } else {
        setMessage("✅ Vérifie tes e-mails pour confirmer ton inscription !");
      }
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSignup}
      className="space-y-4 p-4 bg-white shadow rounded-xl"
    >
      <h2 className="text-lg font-bold">Créer un compte</h2>

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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Création en cours..." : "Créer mon compte"}
      </button>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}