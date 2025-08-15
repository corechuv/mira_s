import React from "react";
import { supabase } from "../../api/supabase";
import AdminLayout from "../AdminLayout";

type Row = { id:string; email:string; full_name:string|null; is_admin:boolean; last_sign_in_at:string|null };

export default function AdminUsers(){
  const [rows, setRows] = React.useState<Row[]>([]);
  const [q, setQ] = React.useState("");

  async function load(){
    const { data, error } = await supabase.rpc("admin_list_users");
    if(error){ alert(error.message); return; }
    const arr = (data||[]) as Row[];
    const f = q.trim().toLowerCase();
    setRows(!f ? arr : arr.filter(u => (u.email||"").toLowerCase().includes(f) || (u.full_name||"").toLowerCase().includes(f)));
  }
  React.useEffect(()=>{ load().catch(console.error); },[q]);

  async function setAdmin(id:string, val:boolean){
    const { error } = await supabase.rpc("admin_set_user_admin", { p_user_id:id, p_is_admin:val });
    if(error) alert(error.message);
    await load();
  }

  return (
    <AdminLayout>
      <div className="card" style={{padding:16, display:"grid", gap:12}}>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <input className="input" placeholder="Поиск по email/имени…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div style={{display:"grid", gap:8}}>
          {rows.map(u=>(
            <div key={u.id} className="card" style={{padding:12, display:"grid", gap:6, gridTemplateColumns:"1fr auto", alignItems:"center"}}>
              <div>
                <b>{u.email}</b> {u.full_name && <span className="muted">({u.full_name})</span>}
                <div className="muted">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "никогда не входил"}</div>
              </div>
              <div>
                <label className="btn">
                  <input type="checkbox" checked={u.is_admin} onChange={e=>setAdmin(u.id, e.target.checked)} />
                  <span style={{marginLeft:8}}>{u.is_admin ? "Admin" : "Make admin"}</span>
                </label>
              </div>
            </div>
          ))}
          {!rows.length && <div className="muted">Пользователей нет.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
