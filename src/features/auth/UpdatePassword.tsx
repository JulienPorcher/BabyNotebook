// src/pages/ResetPassword.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [canReset, setCanReset] = useState(false);
  const navigate = useNavigate();

  // Vérifier si on est bien dans le flux de récupération
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("event:", event, "session:", session);
        if (event === "PASSWORD_RECOVERY") {
          setCanReset(true);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      supabase.auth.exchangeCodeForSession(hash).then(({ data, error }) => {
        if (error) {
          console.error("Erreur exchangeCodeForSession:", error.message);
          setMessage("❌ Lien invalide ou expiré. Merci de recommencer.");
        } else if (data?.session) {
          console.log("Session récupérée via exchangeCodeForSession:", data);
          setCanReset(true);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setMessage("❌ Merci de saisir un mot de passe");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("❌ Erreur : " + error.message);
    } else {
      setMessage("✅ Mot de passe mis à jour avec succès !");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  if (!canReset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">
          Lien invalide ou expiré. Merci de recommencer la procédure de
          récupération.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Réinitialiser le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                type="password"
                placeholder="Nouveau mot de passe"
                className="w-full border rounded-lg px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Mettre à jour</Button>
            {message && <p className="text-sm mt-2">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
