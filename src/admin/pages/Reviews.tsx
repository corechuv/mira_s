import React from "react";
import { supabase } from "../../api/supabase";
import AdminLayout from "../AdminLayout";

type Row = { id:string; product_id:string; rating:number; body:string|null; is_public:boolean; created_at:string };

export default function AdminReviews(){
  const [rows, setRows] = React.useState<Row[]>([]);
  const [q, setQ] = React.useState("");

  async function load(){
    const { data } = await supabase
      .from("reviews")
      .select("id,product_id,rating,body,is_public,created_at")
      .order("created_at",{ ascending:false })
      .limit(200);
    const filtered = (data||[]).filter(r => !q || (r.body||"").toLowerCase().includes(q.toLowerCase()) || r.product_id.includes(q));
    setRows(filtered);
  }
  React.useEffect(()=>{ load().catch(console.error); },[q]);

  async function togglePublic(r:Row){
    await supabase.from("reviews").update({ is_public: !r.is_public }).eq("id", r.id);
    await load();
  }
  async function remove(r:Row){
    if(!confirm("Удалить отзыв?")) return;
    await supabase.from("reviews").delete().eq("id", r.id);
    await load();
  }

  return (
    <AdminLayout>
      <div className="card" style={{padding:16, display:"grid", gap:12}}>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <input className="input" placeholder="Поиск по тексту или product_id…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div style={{display:"grid", gap:8}}>
          {rows.map(r=>(
            <div key={r.id} className="card" style={{padding:12, display:"grid", gap:6}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div>
                  <b>★ {r.rating}</b> — {new Date(r.created_at).toLocaleString()}
                  <div className="muted">product: {r.product_id}</div>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button className="btn" onClick={()=>togglePublic(r)}>{r.is_public? "Скрыть" : "Опубликовать"}</button>
                  <button className="btn" onClick={()=>remove(r)}>Удалить</button>
                </div>
              </div>
              {r.body && <div>{r.body}</div>}
            </div>
          ))}
          {!rows.length && <div className="muted">Нет отзывов.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
