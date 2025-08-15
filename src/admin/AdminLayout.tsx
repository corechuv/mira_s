import React from "react";
import { Link, useRouter } from "../router";
import { useAuth } from "../store/auth";
import { supabase } from "../api/supabase";

function useIsAdmin(){
  const { session } = useAuth();
  const [admin, setAdmin] = React.useState(false);
  React.useEffect(()=>{
    let active = true;
    (async ()=>{
      if (!session?.user?.id){ setAdmin(false); return; }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).maybeSingle();
      if(active) setAdmin(!!data?.is_admin);
    })();
    return ()=>{ active = false; };
  },[session?.user?.id]);
  return admin;
}

export default function AdminLayout({ children }:{ children?:React.ReactNode }){
  const isAdmin = useIsAdmin();
  const { push } = useRouter();

  React.useEffect(()=>{
    // не админов уводим на главную
    if (isAdmin === false) push("/");
  },[isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="card" style={{padding:16}}>Загрузка… или нет прав</div>
      </div>
    );
  }

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
