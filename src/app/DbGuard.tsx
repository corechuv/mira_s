import React from "react";
import { supabase } from "../api/supabase";

export default function DbGuard({ children }:{ children: React.ReactNode }){
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [msg, setMsg] = React.useState<string>("");

  React.useEffect(()=>{
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if(!url || !key){
      setOk(false);
      setMsg("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local");
      return;
    }
    (async ()=>{
      try{
        const { error } = await supabase
          .from("products")
          .select("id", { head: true, count: "exact" })
          .limit(1);
        if(error){ setOk(false); setMsg(error.message); }
        else setOk(true);
      }catch(e:any){
        setOk(false); setMsg(e?.message ?? "Unknown error");
      }
    })();
  },[]);

  if(ok === null){
    return <div className="center" style={{height:"40vh"}}>
      <div className="card" style={{padding:16}}>Connecting to database…</div>
    </div>;
  }
  if(!ok){
    return <div className="container" style={{paddingTop:24}}>
      <div className="card" style={{padding:16}}>
        <h2>Database connection failed</h2>
        <p style={{color:"var(--muted)"}}>{msg}</p>
        <ol style={{marginTop:8, paddingLeft:18}}>
          <li>Create <code>.env.local</code> with Supabase keys.</li>
          <li>Restart <code>npm run dev</code> (Vite перезагружает env только при рестарте).</li>
          <li>Убедись, что RLS для <code>products</code> позволяет SELECT (policy: is_active = true).</li>
        </ol>
      </div>
    </div>;
  }
  return <>{children}</>;
}
