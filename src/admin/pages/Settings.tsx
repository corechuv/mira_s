import React from "react";
import AdminLayout from "../AdminLayout";
import { getSettings, saveSettings, type SiteSettings } from "../../api/settings";

export default function AdminSettings(){
  const [st, setSt] = React.useState<SiteSettings>({});
  const [msg, setMsg] = React.useState("");

  React.useEffect(()=>{
    getSettings().then(setSt).catch(console.error);
  },[]);

  async function save(){
    setMsg("");
    try{ const next = await saveSettings(st); setSt(next); setMsg("Сохранено"); }catch(e:any){ setMsg(e?.message||"Ошибка"); }
  }

  return (
    <AdminLayout>
      <div className="card" style={{padding:16, display:"grid", gap:12, maxWidth:800}}>
        <h2>Настройки</h2>

        <label>Символ валюты
          <input className="input" placeholder="€" value={st.currency_symbol||""} onChange={e=>setSt({...st, currency_symbol:e.target.value})}/>
        </label>

        <label>Тема по умолчанию
          <select className="input" value={st.theme_default||"light"} onChange={e=>setSt({...st, theme_default: e.target.value as any})}>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="pink">pink</option>
          </select>
        </label>

        <label>Hero title
          <input className="input" value={st.hero_title||""} onChange={e=>setSt({...st, hero_title:e.target.value})}/>
        </label>

        <label>Hero subtitle
          <textarea className="input" rows={3} value={st.hero_subtitle||""} onChange={e=>setSt({...st, hero_subtitle:e.target.value})}/>
        </label>

        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <button className="btn primary" onClick={save}>Сохранить</button>
          {msg && <small className="muted">{msg}</small>}
        </div>
      </div>
    </AdminLayout>
  );
}
