import React from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Filters from "../components/Filters";
import type { FiltersState } from "../components/Filters";
import ProductCard from "../components/ProductCard";
import { Link, useRouter } from "../router";
import Reveal from "../components/Reveal";
import { listProducts } from "../api/products";

function useParamsPath(){
  const { pathname } = useRouter();
  const parts = pathname.split("?")[0].split("/").filter(Boolean); // ["catalog",...]
  return parts.slice(1); // 0..3
}

export default function CatalogPage(){
  const levels = useParamsPath();
  const [filters, setFilters] = React.useState<FiltersState>({ attrs:{}, sort:"popular" });
  const [list, setList] = React.useState<any[]>([]);

  React.useEffect(()=>{
    const f: any = {};
    if(filters.attrs["бренд"]?.length) f.brand = filters.attrs["бренд"];
    if(filters.attrs["оттенок"]?.length) f.shade = filters.attrs["оттенок"];
    if(filters.attrs["тип кожи"]?.length) f.skin_type = filters.attrs["тип кожи"];
    if(filters.attrs["объем"]?.length) f.volume = filters.attrs["объем"];
    listProducts({
      lvl1: levels[0], lvl2: levels[1], lvl3: levels[2],
      min: filters.min, max: filters.max,
      sort: filters.sort, filters: f
    }).then(setList).catch(console.error);
  },[levels.join("/"), JSON.stringify(filters)]);

  const crumbs = [{label:"Главная",href:"/"},{label:"Каталог",href:"/catalog"}];
  levels[0] && crumbs.push({label:levels[0],href:`/catalog/${levels[0]}`});
  levels[1] && crumbs.push({label:levels[1],href:`/catalog/${levels.slice(0,2).join("/")}`});
  levels[2] && crumbs.push({label:levels[2]});

  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <Breadcrumbs items={crumbs}/>
      <div className="grid" style={{gridTemplateColumns:"280px 1fr", gap:16}}>
        <Reveal anim="slide-left"><div><Filters filters={filters} onChange={setFilters}/></div></Reveal>
        <div style={{display:"grid",gap:12}}>
          <Reveal><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <h1 style={{textTransform:"capitalize"}}>{levels.join(" / ") || "Каталог"}</h1>
            <div className="navbar">
              <Link to="/catalog" className="navbtn">Все</Link>
              <Link to="/catalog/ukhod" className="navbtn">Уход</Link>
              <Link to="/catalog/makiyazh" className="navbtn">Макияж</Link>
              <Link to="/catalog/volosy" className="navbtn">Волосы</Link>
            </div>
          </div></Reveal>
          <div className="grid-products">
            {list.map(p=> <ProductCard key={p.id} p={p}/>)}
          </div>
          {!list.length && <p style={{color:"var(--muted)"}}>Ничего не найдено под текущие фильтры.</p>}
        </div>
      </div>
    </div>
  );
}
