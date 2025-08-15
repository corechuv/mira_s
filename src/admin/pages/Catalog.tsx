import React from "react";
import { supabase } from "../../api/supabase";
import AdminLayout from "../AdminLayout";

/** Умеем переименовывать значения в products.category_l1/2/3 массово.
 *  Таблицу категорий НЕ вводим — максимум совместимости с текущим фронтом.
 */
type Level = "category_l1"|"category_l2"|"category_l3";

async function distinct(level:Level){
  const { data, error } = await supabase.rpc("exec_sql_json", {
    sql: `select ${level} as v, count(*) as c from public.products group by ${level} order by ${level}`
  } as any);
  if(error){ console.error(error.message); return []; }
  return (data as any[] || []).map(r=>({ v:r.v as string, c: +r.c }));
}

export default function AdminCatalog(){
  const [l1, setL1] = React.useState<{v:string,c:number}[]>([]);
  const [l2, setL2] = React.useState<{v:string,c:number}[]>([]);
  const [l3, setL3] = React.useState<{v:string,c:number}[]>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(()=>{
    (async ()=>{
      // если нет RPC exec_sql_json — покажем подсказку ниже.
      try{
        setL1(await distinct("category_l1"));
        setL2(await distinct("category_l2"));
        setL3(await distinct("category_l3"));
      }catch(e){ console.warn(e); }
    })();
  },[]);

  async function rename(level:Level, from:string, to:string){
    setBusy(true);
    const { error } = await supabase.from("products").update({ [level]: to }).eq(level, from);
    if(error) alert(error.message);
    // перезагрузим
    setL1(await distinct("category_l1"));
    setL2(await distinct("category_l2"));
    setL3(await distinct("category_l3"));
    setBusy(false);
  }

  function Block({title, data, level}:{title:string; data:{v:string,c:number}[]; level:Level}){
    const [from, setFrom] = React.useState(""); const [to, setTo] = React.useState("");
    return (
      <div className="card" style={{padding:12, display:"grid", gap:8}}>
        <h3 style={{margin:0}}>{title}</h3>
        <div style={{display:"grid", gap:6}}>
          {data.map((r,i)=>(
            <div key={i} style={{display:"flex", gap:8, alignItems:"center"}}>
              <div style={{minWidth:220}}>{r.v || <i className="muted">— пусто —</i>}</div>
              <small className="muted">{r.c}</small>
            </div>
          ))}
          {!data.length && <div className="muted">Требуется RPC exec_sql_json или нет данных.</div>}
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
          <input className="input" placeholder="Старое значение" value={from} onChange={e=>setFrom(e.target.value)} />
          <input className="input" placeholder="Новое значение" value={to} onChange={e=>setTo(e.target.value)} />
          <button className="btn" disabled={!from || !to || busy} onClick={()=>rename(level, from, to)}>Переименовать</button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div style={{display:"grid", gap:12}}>
        <Block title="Уровень 1 (category_l1)" data={l1} level="category_l1"/>
        <Block title="Уровень 2 (category_l2)" data={l2} level="category_l2"/>
        <Block title="Уровень 3 (category_l3)" data={l3} level="category_l3"/>
      </div>
    </AdminLayout>
  );
}
