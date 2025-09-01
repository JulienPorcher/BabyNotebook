import SignupForm from "./authService";
import LoginForm from "./LoginForm";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <LoginForm />

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } })
          }
          className="w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Connexion avec Google
        </button>

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: "apple", options: { redirectTo: `${window.location.origin}/auth/callback` } })
          }
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Connexion avec Apple
        </button>

        <SignupForm />
      </div>
    </div>
  );
}
