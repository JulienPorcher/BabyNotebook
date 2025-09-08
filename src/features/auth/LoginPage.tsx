import { useState } from "react";
import SignupForm from "./authService";
import LoginForm from "./LoginForm";
import { supabase } from "../../lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";
import backgroundImage from "../../assets/background_login_day.svg";
import "../../components/ui/Login.css"

export default function LoginPage() {

  const [isSignup, setIsSignup] = useState(false);

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) console.error("Erreur Google Auth:", error.message);
  }

  return (
    <div
      className="login-page-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Formulaire */}
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-2xl shadow-lg z-10 relative">
        <h1 className="text-2xl font-bold text-center">
          {isSignup ? "Créer un compte" : "Connexion"}
        </h1>

        {isSignup ? <SignupForm /> : <LoginForm />}

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
        >
          <FcGoogle size={20} />
          <span className="font-medium">Continuer avec Google</span>
        </button>

        <div className="text-center">
          {isSignup ? (
            <p className="text-sm">
              Déjà un compte ?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsSignup(false)}
              >
                Se connecter
              </button>
            </p>
          ) : (
            <p className="text-sm">
              Pas encore de compte ?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsSignup(true)}
              >
                Créer un compte
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}