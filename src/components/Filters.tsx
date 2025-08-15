import React from "react";
import { Icon } from "../icons/Icon";

export type FiltersState = {
  min?: number; max?: number;
  attrs: Record<string, string[]>;
  sort: "popular"|"price_asc"|"price_desc"|"rating_desc";
};

const ATTR_OPTIONS: Record<string,string[]> = {
  "бренд": ["GlowLab","Dermis","Luxe","Natura","Aroma","HairPro"],
  "оттенок": ["nude","red","pink","clear","brown","peach"],
  "тип кожи": ["сухая","жирная","нормальная","чувствительная","комбинированная"],
  "объем": ["30 мл","50 мл","75 мл","100 мл","150 мл","200 мл","250 мл"]
};

export default function Filters({ filters, onChange }:{ filters:FiltersState; onChange:(f:FiltersState)=>void }){
  function toggleAttr(key:string, val:string){
    const list = new Set(filters.attrs[key] ?? []);
    if(list.has(val)) list.delete(val); else list.add(val);
    onChange({ ...filters, attrs:{ ...filters.attrs, [key]: Array.from(list) } });
  }
  return (
    <aside className="card" style={{padding:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Icon name="filter"/><b>Filters</b></div>
      <label>Price, from</label>
      <input className="input" type="number" value={filters.min ?? ""} onChange={e=>onChange({ ...filters, min: e.target.value ? Number(e.target.value) : undefined })}/>
      <label>Price, to</label>
      <input className="input" type="number" value={filters.max ?? ""} onChange={e=>onChange({ ...filters, max: e.target.value ? Number(e.target.value) : undefined })}/>
      <div className="divider"></div>
      <b>Attributes</b>
      <div style={{display:"grid",gap:6,marginTop:6}}>
        {Object.entries(ATTR_OPTIONS).map(([k,vals])=>(
          <details key={k} open>
            <summary style={{cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Icon name="chevron-down"/>{k}</summary>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
              {vals.map(v=>(
                <label key={k+v} className="navbtn" style={{cursor:"pointer"}}>
                  <input type="checkbox" style={{marginRight:6}} checked={!!filters.attrs[k]?.includes(v)} onChange={()=>toggleAttr(k,v)}/>
                  {v}
                </label>
              ))}
            </div>
          </details>
        ))}
      </div>
      <div className="divider"></div>
      <label>Sort by</label>
      <select className="select" value={filters.sort} onChange={e=>onChange({ ...filters, sort: e.target.value as any })}>
        <option value="popular">Most Popular</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating_desc">Highest Rated</option>
      </select>
    </aside>
  );
}
