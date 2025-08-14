import React from "react";
import { Link } from "../router";

export default function Breadcrumbs({ items }:{ items: { label:string; href?:string }[] }){
  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      {items.map((it,i)=>(
        <span key={i}>
          {it.href ? <Link to={it.href}>{it.label}</Link> : <span>{it.label}</span>}
          {i < items.length-1 ? " / " : ""}
        </span>
      ))}
    </nav>
  );
}
