import React from "react";
import { useAuth } from "../../store/auth";
import { price } from "../../utils/money";
import { supabase } from "../../api/supabase";
import { fetchProfile, saveProfile, listAddresses, createAddress, updateAddress, deleteAddress, listOrders } from "../../api/user";

function Section({ title, children }:{ title:string; children:React.ReactNode }){
  return <section className="card" style={{padding:16,display:"grid",gap:12}}><h2>{title}</h2>{children}</section>;
}
function Field({ label, children }:{ label:string; children:React.ReactNode }){
  return <label style={{display:"grid",gap:6}}><span className="muted">{label}</span>{children}</label>;
}

export default function AccountPage(){
  const { session, loading, recovery, signIn, signUp, signOut, resetPassword, updatePassword } = useAuth();
  const [tab,setTab] = React.useState<"profile"|"addresses"|"orders">("profile");
  const [msg,setMsg] = React.useState(""); const [err,setErr] = React.useState("");

  if(!session){
    return (
      <div className="container" style={{display:"grid",gap:16}}>
        <h1>Личный кабинет</h1>
        <AuthCard
          onSignIn={async (e,p)=>{ setMsg(""); setErr(""); try{ await signIn(e,p);}catch(ex:any){ setErr(ex?.message||"Ошибка авторизации"); } }}
          onSignUp={async (e,p)=>{ setErr(""); try{ await signUp(e,p); setMsg("Письмо подтверждения отправлено. Проверьте почту/спам."); }catch(ex:any){ setErr(ex?.message||"Ошибка регистрации"); } }}
          onReset={async (e)=>{ setMsg(""); setErr(""); try{ await resetPassword(e); setMsg("Ссылка для восстановления отправлена на email."); }catch(ex:any){ setErr(ex?.message||"Не удалось отправить письмо"); } }}
          loading={loading}
        />
        {(msg||err) && <div className="card" style={{padding:12}}><div style={{color: err ? "var(--danger)":"var(--muted)"}}>{err||msg}</div></div>}
      </div>
    );
  }

  if(recovery){
    return (
      <div className="container" style={{display:"grid",gap:16}}>
        <h1>Смена пароля</h1>
        <PasswordReset onSubmit={async (pwd)=>{ await updatePassword(pwd); setMsg("Пароль обновлён."); }} loading={loading}/>
        {msg && <div className="card" style={{padding:12}}>{msg}</div>}
      </div>
    );
  }

  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <h1>Личный кабинет</h1>

      <section className="card" style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <div>
          <div>Вы вошли как <b>{session.user.email ?? session.user.id}</b></div>
          {!session.user.email_confirmed_at && (
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <small className="muted">Email не подтверждён — проверьте почту.</small>
              <button className="btn" onClick={async()=>{
                if(!session.user.email) return;
                try{ await supabase.auth.resend({ type:"signup", email: session.user.email }); alert("Письмо отправлено повторно."); }
                catch(e:any){ alert(e?.message || "Не удалось отправить письмо"); }
              }}>Отправить ещё раз</button>
            </div>
          )}
        </div>
        <button className="btn" onClick={signOut}>Выйти</button>
      </section>

      <div className="navbar">
        <button className={"navbtn"+(tab==="profile"?" active":"")} onClick={()=>setTab("profile")}>Профиль</button>
        <button className={"navbtn"+(tab==="addresses"?" active":"")} onClick={()=>setTab("addresses")}>Адреса</button>
        <button className={"navbtn"+(tab==="orders"?" active":"")} onClick={()=>setTab("orders")}>Заказы</button>
      </div>

      {tab==="profile" && <ProfileSection/>}
      {tab==="addresses" && <AddressesSection/>}
      {tab==="orders" && <OrdersSection/>}
    </div>
  );
}

function AuthCard({ onSignIn, onSignUp, onReset, loading }:{
  onSignIn:(email:string,password:string)=>Promise<void>;
  onSignUp:(email:string,password:string)=>Promise<void>;
  onReset:(email:string)=>Promise<void>;
  loading:boolean;
}){
  const [mode,setMode] = React.useState<"login"|"register">("login");
  const [email,setEmail] = React.useState("");
  const [pwd,setPwd] = React.useState("");
  const [err,setErr] = React.useState("");

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setErr("");
    try{ mode==="login" ? await onSignIn(email,pwd) : await onSignUp(email,pwd); }
    catch(ex:any){ setErr(ex?.message || "Ошибка авторизации"); }
  }
  async function doReset(){
    setErr("");
    try{ if(!email) throw new Error("Введите email"); await onReset(email); }
    catch(ex:any){ setErr(ex?.message || "Не удалось отправить письмо"); }
  }

  return (
    <section className="card" style={{padding:16,display:"grid",gap:12,maxWidth:520}}>
      <div className="navbar">
        <button className={"navbtn"+(mode==="login"?" active":"")} onClick={()=>setMode("login")}>Вход</button>
        <button className={"navbtn"+(mode==="register"?" active":"")} onClick={()=>setMode("register")}>Регистрация</button>
      </div>
      <form onSubmit={submit} style={{display:"grid",gap:10}}>
        <Field label="Email"><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></Field>
        <Field label="Пароль"><input className="input" type="password" required minLength={6} value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="минимум 6 символов"/></Field>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn primary" disabled={loading} type="submit">{mode==="login"?"Войти":"Создать аккаунт"}</button>
          {mode==="login" && <button type="button" className="btn" onClick={doReset}>Забыли пароль?</button>}
        </div>
        {err && <div className="badge" style={{borderColor:"var(--danger)",color:"var(--danger)"}}>{err}</div>}
        {mode==="register" && <small className="muted">После регистрации мы отправим письмо для подтверждения email.</small>}
      </form>
    </section>
  );
}

function PasswordReset({ onSubmit, loading }:{ onSubmit:(pwd:string)=>Promise<void>; loading:boolean }){
  const [p1,setP1] = React.useState(""); const [p2,setP2] = React.useState(""); const [err,setErr] = React.useState("");
  async function go(){
    setErr("");
    try{
      if(p1.length<6) throw new Error("Пароль должен быть не короче 6 символов");
      if(p1!==p2) throw new Error("Пароли не совпадают");
      await onSubmit(p1);
    }catch(ex:any){ setErr(ex?.message || "Ошибка обновления пароля"); }
  }
  return (
    <section className="card" style={{padding:16,display:"grid",gap:10,maxWidth:520}}>
      <Field label="Новый пароль"><input className="input" type="password" value={p1} onChange={e=>setP1(e.target.value)}/></Field>
      <Field label="Повторите пароль"><input className="input" type="password" value={p2} onChange={e=>setP2(e.target.value)}/></Field>
      <button className="btn primary" onClick={go} disabled={loading}>Сохранить</button>
      {err && <div className="badge" style={{borderColor:"var(--danger)",color:"var(--danger)"}}>{err}</div>}
    </section>
  );
}

function ProfileSection(){
  const [profile, setProfile] = React.useState<{full_name?:string; phone?:string}>({});
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  React.useEffect(()=>{ fetchProfile().then(p=>setProfile({full_name:p?.full_name??"", phone:p?.phone??""})).catch(console.error); },[]);
  async function save(){ setBusy(true); setMsg(""); try{ await saveProfile(profile); setMsg("Профиль сохранён"); }catch(e:any){ setMsg(e?.message||"Ошибка"); } setBusy(false); }
  return (
    <Section title="Профиль">
      <div className="form-row">
        <Field label="Имя"><input className="input" value={profile.full_name||""} onChange={e=>setProfile({...profile, full_name:e.target.value})}/></Field>
        <Field label="Телефон"><input className="input" value={profile.phone||""} onChange={e=>setProfile({...profile, phone:e.target.value})}/></Field>
      </div>
      <div><button className="btn primary" onClick={save} disabled={busy}>Сохранить</button> {msg && <small className="muted" style={{marginLeft:8}}>{msg}</small>}</div>
    </Section>
  );
}

function AddressesSection(){
  const empty = { country:"Germany", city:"", zip:"", street:"", house:"" };
  const [list, setList] = React.useState<any[]>([]);
  const [form, setForm] = React.useState<any>(empty);
  const [msg,setMsg] = React.useState("");
  async function load(){ setList(await listAddresses()); }
  React.useEffect(()=>{ load().catch(console.error); },[]);
  async function add(){ await createAddress(form); setForm(empty); setMsg("Адрес добавлен"); await load(); }
  async function upd(id:string, patch:any){ await updateAddress(id, patch); setMsg("Сохранено"); await load(); }
  async function del(id:string){ await deleteAddress(id); setMsg("Удалено"); await load(); }
  return (
    <>
      <Section title="Новый адрес">
        <div className="form-row">
          <Field label="Страна"><input className="input" value={form.country} onChange={e=>setForm({...form, country:e.target.value})}/></Field>
          <Field label="Город"><input className="input" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}/></Field>
        </div>
        <div className="form-row">
          <Field label="Индекс"><input className="input" value={form.zip} onChange={e=>setForm({...form, zip:e.target.value})}/></Field>
          <Field label="Улица"><input className="input" value={form.street} onChange={e=>setForm({...form, street:e.target.value})}/></Field>
        </div>
        <Field label="Дом / Кв"><input className="input" value={form.house} onChange={e=>setForm({...form, house:e.target.value})}/></Field>
        <button className="btn primary" onClick={add}>Добавить адрес</button> {msg && <small className="muted">{msg}</small>}
      </Section>
      <Section title="Сохранённые адреса">
        {!list.length && <p className="muted">Пока пусто.</p>}
        <div style={{display:"grid",gap:8}}>
          {list.map(a=>(
            <div key={a.id} className="card" style={{padding:12, display:"grid", gap:8}}>
              <div className="form-row">
                <input className="input" value={a.country||""} onChange={e=>a.country=e.target.value}/>
                <input className="input" value={a.city||""} onChange={e=>a.city=e.target.value}/>
              </div>
              <div className="form-row">
                <input className="input" value={a.zip||""} onChange={e=>a.zip=e.target.value}/>
                <input className="input" value={a.street||""} onChange={e=>a.street=e.target.value}/>
              </div>
              <div className="form-row">
                <input className="input" value={a.house||""} onChange={e=>a.house=e.target.value}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn primary" onClick={()=>upd(a.id, { country:a.country, city:a.city, zip:a.zip, street:a.street, house:a.house })}>Сохранить</button>
                <button className="btn" onClick={()=>del(a.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function OrdersSection(){
  const [orders, setOrders] = React.useState<any[]>([]);
  React.useEffect(()=>{ listOrders().then(setOrders).catch(console.error); },[]);
  return (
    <Section title="Заказы">
      {!orders.length && <p className="muted">История заказов пуста.</p>}
      {!!orders.length && (
        <div className="card" style={{overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>#</th>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>Статус</th>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>Сумма</th>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.id}>
                  <td style={{padding:10,borderBottom:"1px solid var(--border)"}}>{o.id.slice(0,8)}</td>
                  <td style={{padding:10,borderBottom:"1px solid var(--border)"}}>{o.status}</td>
                  <td style={{padding:10,borderBottom:"1px solid var(--border)"}}>{price(o.total)}</td>
                  <td style={{padding:10,borderBottom:"1px solid var(--border)"}}>{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
