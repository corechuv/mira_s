import React from "react";
import { Link } from "../router";
import { useAuth } from "../store/auth";
import { supabase } from "../api/supabase";

type Status = "loading" | "guest" | "user" | "admin";

async function fetchIsAdmin(userId:string){
  const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (error) throw error;
  return !!data?.is_admin;
}

export default function AdminLayout({ children }:{ children?:React.ReactNode }){
  const { session } = useAuth();
  const [status, setStatus] = React.useState<Status>("loading");

  React.useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      if (!session || !session.user?.id){ setStatus("guest"); return; }
      try{
        const ok = await fetchIsAdmin(session.user.id);
        if(!cancelled) setStatus(ok ? "admin" : "user");
      }catch{
        if(!cancelled) setStatus("user");
      }
    })();
    return ()=>{ cancelled = true; };
  },[session?.user?.id]);

  if (status === "loading"){
    return <div className="container"><div className="card" style={{padding:16}}>Загрузка…</div></div>;
  }
  if (status === "guest"){
    return (
      <div className="container">
        <div className="card" style={{padding:16, display:"grid", gap:8}}>
          <h2>Нужен вход</h2>
          <div className="muted">Для доступа в админ-панель войдите в аккаунт с правами администратора.</div>
          <div style={{display:"flex", gap:8}}>
            <Link to="/account" className="btn primary">Войти</Link>
            <Link to="/" className="btn">На главную</Link>
          </div>
        </div>
      </div>
    );
  }
  if (status === "user"){
    return (
      <div className="container">
        <div className="card" style={{padding:16, display:"grid", gap:8}}>
          <h2>Нет прав</h2>
          <div className="muted">У этого аккаунта нет доступа к админке.</div>
          <div style={{display:"flex", gap:8}}>
            <Link to="/" className="btn">На главную</Link>
            <Link to="/account" className="btn">Сменить аккаунт</Link>
          </div>
        </div>
      </div>
    );
  }

  // status === "admin"
  return (
    <div className="container" style={{display:"grid", gap:16}}>
      <div className="card" style={{padding:12, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
        <b>Admin</b>
        <Link to="/admin" className="btn">Dashboard</Link>
        <Link to="/admin/products" className="btn">Товары</Link>
        <Link to="/admin/catalog" className="btn">Категории</Link>
        <Link to="/admin/reviews" className="btn">Отзывы</Link>
        <Link to="/admin/users" className="btn">Пользователи</Link>
        <Link to="/admin/settings" className="btn">Настройки</Link>
        <span style={{flex:1}}/>
        <Link to="/" className="btn">← В магазин</Link>
      </div>
      {children}
    </div>
  );
}
