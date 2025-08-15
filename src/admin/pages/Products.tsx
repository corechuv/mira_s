import React from "react";
import { supabase } from "../../api/supabase";
import AdminLayout from "../AdminLayout";

type Prod = {
  id:string; slug:string; title:string; price:number; old_price:number|null;
  rating:number; rating_count:number;
  category_l1:string; category_l2:string; category_l3:string;
  short:string|null;
};
type Img = { id:string; url:string; sort:number };

export default function AdminProducts(){
  const [list, setList] = React.useState<Prod[]>([]);
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState<Prod|null>(null);
  const [images, setImages] = React.useState<Img[]>([]);
  const [busy, setBusy] = React.useState(false);

  async function load(){
    const query = supabase
      .from("products")
      .select("id,slug,title,price,old_price,rating,rating_count,category_l1,category_l2,category_l3,short")
      .order("created_at", { ascending:false });
    if(q.trim()) query.ilike("title", `%${q}%`);
    const { data } = await query;
    setList(data||[]);
  }
  React.useEffect(()=>{ load().catch(console.error); },[q]);

  async function openEdit(p:Prod){
    setEditing(p);
    const { data } = await supabase.from("product_images").select("id,url,sort").eq("product_id", p.id).order("sort",{ascending:true});
    setImages(data||[]);
  }

  async function save(){
    if(!editing) return;
    setBusy(true);
    const { id, ...payload } = editing;
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if(!error) await load();
    setBusy(false);
  }

  async function create(){
    const base = { slug:"new-"+Date.now(), title:"Новый товар", price:0, old_price:null, rating:0, rating_count:0,
      category_l1:"Категория", category_l2:"Подкатегория", category_l3:"Раздел", short:null };
    const { data, error } = await supabase.from("products").insert(base).select("id").single();
    if(!error && data){ await load(); setEditing({ ...base, id:data.id } as Prod); setImages([]); }
  }

  async function remove(id:string){
    if(!confirm("Удалить товар?")) return;
    await supabase.from("products").delete().eq("id", id);
    if(editing?.id===id){ setEditing(null); setImages([]); }
    await load();
  }

  async function uploadImage(file: File){
    if(!editing) return;
    const path = `${editing.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert:true });
    if(upErr){ alert(upErr.message); return; }
    // Надёжный helper из SQL: storage_public_url
    const { data:pub } = await supabase.rpc("storage_public_url", { p_path: path });
    const url = (pub as any) || null;
    const { data:img } = await supabase.from("product_images").insert({ product_id: editing.id, url, sort: (images.at(-1)?.sort||0)+1 }).select("*").single();
    setImages(prev => [...prev, img as any]);
  }

  async function deleteImage(id:string){
    await supabase.from("product_images").delete().eq("id", id);
    setImages(prev=> prev.filter(i=>i.id!==id));
  }

  return (
    <AdminLayout>
      <div className="card" style={{padding:16, display:"grid", gap:12}}>
        <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
          <input className="input" placeholder="Поиск по названию…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn primary" onClick={create}>+ Новый товар</button>
        </div>

        <div style={{display:"grid", gap:8}}>
          {list.map(p=>(
            <div key={p.id} className="card" style={{padding:12, display:"grid", gap:8, gridTemplateColumns:"1fr auto", alignItems:"center"}}>
              <div>
                <b>{p.title}</b> <span className="muted">/{p.slug}</span><br/>
                <small>{p.category_l1} › {p.category_l2} › {p.category_l3}</small>
              </div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn" onClick={()=>openEdit(p)}>Редактировать</button>
                <button className="btn" onClick={()=>remove(p.id)}>Удалить</button>
              </div>
            </div>
          ))}
          {!list.length && <div className="muted">Нет товаров.</div>}
        </div>

        {editing && (
          <div className="card" style={{padding:16, display:"grid", gap:12}}>
            <h3 style={{margin:0}}>Редактирование: {editing.title}</h3>
            <div style={{display:"grid", gap:8, gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>
              <label>Название<input className="input" value={editing.title} onChange={e=>setEditing({...editing!, title:e.target.value})}/></label>
              <label>Slug<input className="input" value={editing.slug} onChange={e=>setEditing({...editing!, slug:e.target.value})}/></label>
              <label>Цена (€)<input className="input" type="number" value={editing.price} onChange={e=>setEditing({...editing!, price:+e.target.value})}/></label>
              <label>Старая цена (€)<input className="input" type="number" value={editing.old_price??""} onChange={e=>setEditing({...editing!, old_price:e.target.value===""?null:+e.target.value})}/></label>
              <label>L1<input className="input" value={editing.category_l1} onChange={e=>setEditing({...editing!, category_l1:e.target.value})}/></label>
              <label>L2<input className="input" value={editing.category_l2} onChange={e=>setEditing({...editing!, category_l2:e.target.value})}/></label>
              <label>L3<input className="input" value={editing.category_l3} onChange={e=>setEditing({...editing!, category_l3:e.target.value})}/></label>
            </div>
            <label>Короткое описание<textarea className="input" rows={4} value={editing.short||""} onChange={e=>setEditing({...editing!, short:e.target.value||null})}/></label>

            <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
              <button className="btn primary" disabled={busy} onClick={save}>Сохранить</button>
              <span className="muted">Рейтинг: {editing.rating.toFixed(1)} ({editing.rating_count})</span>
            </div>

            <div>
              <b>Изображения</b>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:8}}>
                {images.map(img=>(
                  <div key={img.id} className="card" style={{padding:6}}>
                    <img src={img.url} style={{width:120, height:120, objectFit:"cover", borderRadius:8}}/>
                    <div><button className="btn" onClick={()=>deleteImage(img.id)}>Удалить</button></div>
                  </div>
                ))}
                <label className="btn">
                  + Загрузить
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files && uploadImage(e.target.files[0])}/>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
