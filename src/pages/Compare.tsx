import React from "react";
import { useCompare } from "../store/store";
import { price } from "../utils/money";
import { listProductsByIds } from "../api/products";

export default function ComparePage(){
  const { state } = useCompare();
  const [list, setList] = React.useState<any[]>([]);
  React.useEffect(()=>{ listProductsByIds(state.ids).then(setList).catch(console.error); },[state.ids.join(",")]);
  return (
    <div className="container" style={{display:"grid",gap:12}}>
      <h1>Сравнение</h1>
      {!list.length && <p style={{color:"var(--muted)"}}>Добавьте товары в сравнение.</p>}
      {!!list.length && (
        <div className="card" style={{overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{list.map((p:any)=><th key={p.id} style={{padding:12,borderBottom:"1px solid var(--border)",textAlign:"left"}}>{p.title}</th>)}</tr>
            </thead>
            <tbody>
              <tr>{list.map((p:any)=><td key={p.id} style={{padding:12,borderBottom:"1px solid var(--border)"}}>{price(p.price)}</td>)}</tr>
              <tr>{list.map((p:any)=><td key={p.id} style={{padding:12,borderBottom:"1px solid var(--border)"}}>Рейтинг: {p.rating}</td>)}</tr>
              <tr>{list.map((p:any)=><td key={p.id} style={{padding:12,borderBottom:"1px solid var(--border)"}}>{Object.entries(p.attrs).map(([k,v]:any)=><div key={k}><b>{k}:</b> {v}</div>)}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
