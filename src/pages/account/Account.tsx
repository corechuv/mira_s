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
          onSignIn={async (e,p)=>{ setMsg(""); setErr(""); try{ await signIn(e,p);}catch(ex:any){ setErr(ex?.message||"Error"); } }}
          onSignUp={async (e,p)=>{ setErr(""); try{ await signUp(e,p); setMsg("Confirmation email sent. Please check your inbox/spam."); }catch(ex:any){ setErr(ex?.message||"Error"); } }}
          onReset={async (e)=>{ setMsg(""); setErr(""); try{ await resetPassword(e); setMsg("Password reset link sent to email."); }catch(ex:any){ setErr(ex?.message||"Error"); } }}
          loading={loading}
        />
        {(msg||err) && <div className="card" style={{padding:12}}><div style={{color: err ? "var(--danger)":"var(--muted)"}}>{err||msg}</div></div>}
      </div>
    );
  }

  if(recovery){
    return (
      <div className="container" style={{display:"grid",gap:16}}>
        <h1>Change Password</h1>
        <PasswordReset onSubmit={async (pwd)=>{ await updatePassword(pwd); setMsg("Password updated."); }} loading={loading}/>
        {msg && <div className="card" style={{padding:12}}>{msg}</div>}
      </div>
    );
  }

  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <h1>Account</h1>

      <section className="card" style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <div>
          <div>You are logged in as <b>{session.user.email ?? session.user.id}</b></div>
          {!session.user.email_confirmed_at && (
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <small className="muted">Email not confirmed — please check your inbox.</small>
              <button className="btn" onClick={async()=>{
                if(!session.user.email) return;
                try{ await supabase.auth.resend({ type:"signup", email: session.user.email }); alert("Email resent."); }
                catch(e:any){ alert(e?.message || "Failed to resend email"); }
              }}>Resend</button>
            </div>
          )}
        </div>
        <button className="btn" onClick={signOut}>Sign Out</button>
      </section>

      <div className="navbar">
        <button className={"navbtn"+(tab==="profile"?" active":"")} onClick={()=>setTab("profile")}>Profile</button>
        <button className={"navbtn"+(tab==="addresses"?" active":"")} onClick={()=>setTab("addresses")}>Addresses</button>
        <button className={"navbtn"+(tab==="orders"?" active":"")} onClick={()=>setTab("orders")}>Orders</button>
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
    catch(ex:any){ setErr(ex?.message || "Authorization error"); }
  }
  async function doReset(){
    setErr("");
    try{ if(!email) throw new Error("Enter email"); await onReset(email); }
    catch(ex:any){ setErr(ex?.message || "Failed to send email"); }
  }

  return (
    <section className="card" style={{padding:16,display:"grid",gap:12,maxWidth:520}}>
      <div className="navbar">
        <button className={"navbtn"+(mode==="login"?" active":"")} onClick={()=>setMode("login")}>Login</button>
        <button className={"navbtn"+(mode==="register"?" active":"")} onClick={()=>setMode("register")}>Register</button>
      </div>
      <form onSubmit={submit} style={{display:"grid",gap:10}}>
        <Field label="Email"><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></Field>
        <Field label="Password"><input className="input" type="password" required minLength={6} value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="at least 6 characters"/></Field>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn primary" disabled={loading} type="submit">{mode==="login"?"Log In":"Create Account"}</button>
          {mode==="login" && <button type="button" className="btn" onClick={doReset}>Forgot Password?</button>}
        </div>
        {err && <div className="badge" style={{borderColor:"var(--danger)",color:"var(--danger)"}}>{err}</div>}
        {mode==="register" && <small className="muted">After registration, we will send a confirmation email.</small>}
      </form>
    </section>
  );
}

function PasswordReset({ onSubmit, loading }:{ onSubmit:(pwd:string)=>Promise<void>; loading:boolean }){
  const [p1,setP1] = React.useState(""); const [p2,setP2] = React.useState(""); const [err,setErr] = React.useState("");
  async function go(){
    setErr("");
    try{
      if(p1.length<6) throw new Error("Password must be at least 6 characters");
      if(p1!==p2) throw new Error("Passwords do not match");
      await onSubmit(p1);
    }catch(ex:any){ setErr(ex?.message || "Failed to update password"); }
  }
  return (
    <section className="card" style={{padding:16,display:"grid",gap:10,maxWidth:520}}>
      <Field label="New Password"><input className="input" type="password" value={p1} onChange={e=>setP1(e.target.value)}/></Field>
      <Field label="Repeat Password"><input className="input" type="password" value={p2} onChange={e=>setP2(e.target.value)}/></Field>
      <button className="btn primary" onClick={go} disabled={loading}>Save</button>
      {err && <div className="badge" style={{borderColor:"var(--danger)",color:"var(--danger)"}}>{err}</div>}
    </section>
  );
}

function ProfileSection(){
  const [profile, setProfile] = React.useState<{full_name?:string; phone?:string}>({});
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  React.useEffect(()=>{ fetchProfile().then(p=>setProfile({full_name:p?.full_name??"", phone:p?.phone??""})).catch(console.error); },[]);
  async function save(){ setBusy(true); setMsg(""); try{ await saveProfile(profile); setMsg("Profile saved"); }catch(e:any){ setMsg(e?.message||"Error"); } setBusy(false); }
  return (
    <Section title="Profile">
      <div className="form-row">
        <Field label="Full Name"><input className="input" value={profile.full_name||""} onChange={e=>setProfile({...profile, full_name:e.target.value})}/></Field>
        <Field label="Phone"><input className="input" value={profile.phone||""} onChange={e=>setProfile({...profile, phone:e.target.value})}/></Field>
      </div>
      <div><button className="btn primary" onClick={save} disabled={busy}>Save</button> {msg && <small className="muted" style={{marginLeft:8}}>{msg}</small>}</div>
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
  async function add(){ await createAddress(form); setForm(empty); setMsg("Address added"); await load(); }
  async function upd(id:string, patch:any){ await updateAddress(id, patch); setMsg("Saved"); await load(); }
  async function del(id:string){ await deleteAddress(id); setMsg("Deleted"); await load(); }
  return (
    <>
      <Section title="New Address">
        <div className="form-row">
          <Field label="Country"><input className="input" value={form.country} onChange={e=>setForm({...form, country:e.target.value})}/></Field>
          <Field label="City"><input className="input" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}/></Field>
        </div>
        <div className="form-row">
          <Field label="ZIP"><input className="input" value={form.zip} onChange={e=>setForm({...form, zip:e.target.value})}/></Field>
          <Field label="Street"><input className="input" value={form.street} onChange={e=>setForm({...form, street:e.target.value})}/></Field>
        </div>
        <Field label="House / Apt"><input className="input" value={form.house} onChange={e=>setForm({...form, house:e.target.value})}/></Field>
        <button className="btn primary" onClick={add}>Add Address</button> {msg && <small className="muted">{msg}</small>}
      </Section>
      <Section title="Saved Addresses">
        {!list.length && <p className="muted">No addresses saved.</p>}
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
                <button className="btn primary" onClick={()=>upd(a.id, { country:a.country, city:a.city, zip:a.zip, street:a.street, house:a.house })}>Save</button>
                <button className="btn" onClick={()=>del(a.id)}>Delete</button>
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
    <Section title="Orders">
      {!orders.length && <p className="muted">No orders found.</p>}
      {!!orders.length && (
        <div className="card" style={{overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>#</th>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>Status</th>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>Total</th>
                <th style={{padding:10,borderBottom:"1px solid var(--border)",textAlign:"left"}}>Date</th>
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
