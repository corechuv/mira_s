import React from "react";
import { supabase } from "../../api/supabase";
import AdminLayout from "../AdminLayout";

export default function AdminDashboard(){
  const [stats, setStats] = React.useState<{products:number; reviews:number; users:number}>({products:0,reviews:0,users:0});
  React.useEffect(()=>{
    (async ()=>{
      const [{ count: pc }, { count: rc }, { count: uc }] = await Promise.all([
        supabase.from("products").select("*",{ count:"exact", head:true }),
        supabase.from("reviews").select("*",{ count:"exact", head:true }),
        supabase.from("profiles").select("*",{ count:"exact", head:true })
      ]);
      setStats({ products: pc||0, reviews: rc||0, users: uc||0 });
    })();
  },[]);
  return (
    <AdminLayout>
      <div className="card" style={{padding:16}}>
        <h2>Сводка</h2>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12}}>
          <div className="card" style={{padding:12}}><b>Товаров</b><div style={{fontSize:24}}>{stats.products}</div></div>
          <div className="card" style={{padding:12}}><b>Отзывов</b><div style={{fontSize:24}}>{stats.reviews}</div></div>
          <div className="card" style={{padding:12}}><b>Пользователей</b><div style={{fontSize:24}}>{stats.users}</div></div>
        </div>
      </div>
    </AdminLayout>
  );
}
