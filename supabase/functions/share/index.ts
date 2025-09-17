// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
// Remove createHash import - using Web Crypto API instead

interface JwtPayload {
  baby_id: string;
  owner_id: string;
  baby_name: string;
  iat?: number;
  exp?: number;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "http://127.0.0.1:54321";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SECRET = Deno.env.get("QR_SHARE_SECRET")!;

// Utils
async function hashToken(token: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  return data.user;
}

// Génération QR (JWT court)
async function createQrShare(req: Request, userId: string) {
  const { babyId } = await req.json();

  const { data: baby } = await supabase
    .from("babies")
    .select("id, user_id, name")
    .eq("id", babyId)
    .single();

  if (!baby || baby.user_id !== userId) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const token = jwt.sign({ baby_id: babyId, owner_id: userId, baby_name: baby.name }, SECRET, {
    expiresIn: "5m"
  });

  return new Response(JSON.stringify({ token }), { status: 200 });
}

// Génération lien email
async function createEmailShare(req: Request, userId: string) {
  const { babyId, email } = await req.json();

  const { data: baby } = await supabase
    .from("babies")
    .select("id, user_id, name")
    .eq("id", babyId)
    .single();

  if (!baby || baby.user_id !== userId) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const rawToken = crypto.randomUUID();
  const hashed = await hashToken(rawToken);

  await supabase.from("baby_share_tokens").insert({
    token_hash: hashed,
    baby_id: babyId,
    owner_id: userId,
    email: email,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });

  // TODO: Send actual email with the link
  // For now, we'll just return success
  const url = `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/share?token=${rawToken}`;
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Email envoyé avec succès",
    url: url // For testing purposes
  }), { status: 200 });
}

// Acceptation partage (QR ou email)
async function acceptShare(req: Request, userId: string) {
  const { token, type } = await req.json();

  if (type === "qr") {
    try {
      const payload = jwt.verify(token, SECRET) as JwtPayload;

      const { data: baby } = await supabase
        .from("babies")
        .select("id, owner_id, name")
        .eq("id", payload.baby_id)
        .single();

      if (!baby || baby.owner_id !== payload.owner_id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
      }

      // Check if user is already sharing this baby
      const { data: existingShare } = await supabase
        .from("baby_shares")
        .select("id")
        .eq("baby_id", payload.baby_id)
        .eq("user_id", userId)
        .single();

      if (existingShare) {
        return new Response(JSON.stringify({ success: true, message: "Already shared" }), { status: 200 });
      }

      // Create baby_shares entry
      const { error } = await supabase.from("baby_shares").insert({
        baby_id: payload.baby_id,
        user_id: userId,
        role: "invited",
        nickname: baby.name
      });

      if (error) {
        console.error("Error creating baby_shares entry:", error);
        return new Response(JSON.stringify({ error: "Failed to create share" }), { status: 500 });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error("JWT verification error:", error);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 });
    }
  }

  if (type === "email") {
    const hash = await hashToken(token);

    const { data: tokenRow } = await supabase
      .from("baby_share_tokens")
      .select("*")
      .eq("token_hash", hash)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!tokenRow) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 });
    }

    // Check if user is already sharing this baby
    const { data: existingShare } = await supabase
      .from("baby_shares")
      .select("id")
      .eq("baby_id", tokenRow.baby_id)
      .eq("user_id", userId)
      .single();

    if (existingShare) {
      return new Response(JSON.stringify({ success: true, message: "Already shared" }), { status: 200 });
    }

    // Get baby name for the share
    const { data: baby } = await supabase
      .from("babies")
      .select("name")
      .eq("id", tokenRow.baby_id)
      .single();

    // Create baby_shares entry
    const { error } = await supabase.from("baby_shares").insert({
      baby_id: tokenRow.baby_id,
      user_id: userId,
      role: "invited",
      nickname: baby?.name || "Baby"
    });

    if (error) {
      console.error("Error creating baby_shares entry:", error);
      return new Response(JSON.stringify({ error: "Failed to create share" }), { status: 500 });
    }

    await supabase.from("baby_share_tokens").update({ used: true }).eq("id", tokenRow.id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Unknown type" }), { status: 400 });
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Router
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = await getUser(req);

    const url = new URL(req.url);
    let response: Response;

    if (req.method === "POST" && url.pathname.endsWith("/create-qr-share")) {
      response = await createQrShare(req, user.id);
    } else if (req.method === "POST" && url.pathname.endsWith("/create-email-share")) {
      response = await createEmailShare(req, user.id);
    } else if (req.method === "POST" && url.pathname.endsWith("/accept-share")) {
      response = await acceptShare(req, user.id);
    } else {
      response = new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch {
    const response = new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/share' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
