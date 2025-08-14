import React from "react";
import { supabase } from "../api/supabase";

export default function AuthDebug(){
  const [out, setOut] = React.useState<string>("…");
  React.useEffect(()=>{
    (async ()=>{
      const logs: string[] = [];
      function log(s:string){ logs.push(s); setOut(logs.join("\\n")); }

      log("ENV:");
      log("  VITE_SUPABASE_URL: " + (import.meta as any).env?.VITE_SUPABASE_URL);
      log("  VITE_SUPABASE_ANON_KEY: " + ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? "present ✔" : "missing ✖"));

      log("\\nREST check (products head):");
      try{
        const { error, count } = await supabase.from("products").select("id", { head:true, count: "exact" }).limit(1);
        if(error) log("  error: " + error.message);
        else log("  ok, count visible (RLS ok) ✔");
      }catch(e:any){ log("  failed: " + (e?.message||e)); }

      log("\\nAuth.getSession():");
      try{
        const { data, error } = await supabase.auth.getSession();
        if(error) log("  error: " + error.message);
        else log("  " + (data?.session ? "session OK ✔ user="+(data.session.user.email||data.session.user.id) : "no session"));
      }catch(e:any){ log("  failed: " + (e?.message||e)); }

      log("\\nHealth ping:");
      try{
        // простой fetch к /rest/v1/ (CORS должен пускать OPTIONS/GET)
        const base = (import.meta as any).env?.VITE_SUPABASE_URL;
        const res = await fetch(base + "/rest/v1/", { method:"OPTIONS" }).catch(()=>null);
        log("  rest/v1 OPTIONS: " + (res ? res.status : "no response"));
      }catch(e:any){ log("  failed: " + (e?.message||e)); }
    })();
  },[]);
  return (
    <div className="container" style={{padding:16}}>
      <h1>Auth Debug</h1>
      <pre className="card" style={{padding:16,whiteSpace:"pre-wrap"}}>{out}</pre>
      <p className="muted">Если REST ок, но сессии нет — проблема в Auth (redirect/SMTP/confirm). Если REST не ок — проверь .env и CORS/URL в Studio.</p>
    </div>
  );
}
