import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ShareEmail({ babyId }: { babyId: string }) {
  const [link, setLink] = useState<string | null>(null);

  const generateLink = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch("/functions/v1/share/create-email-share", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session?.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ babyId })
    });
    const { url } = await res.json();
    setLink(url);
  };

  return (
    <div>
      <button onClick={generateLink}>Partager par email</button>
      {link && <p>Lien : {link}</p>}
    </div>
  );
}
