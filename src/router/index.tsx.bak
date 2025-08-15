// src/router.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Route = {
  path: string;           // "/product/:id"
  element: React.ReactNode;
};

type Match = { params: Record<string,string>, pathname: string };

function normalize(pathname:string){
  // отрезаем ?query, приводим к виду "/foo/bar" без хвостовых слэшей
  const pOnly = pathname.split("?")[0] || "/";
  let p = pOnly.startsWith("/") ? pOnly : "/"+pOnly;
  p = p.replace(/\/+$/,"");
  return p || "/";
}

/* >>> Добавили два helper'а для нормализации в hash-роутинг <<< */
function toHashHref(to:string){
  // принимает "/admin", "admin", "#/admin" и т.п. -> вернёт "#/admin"
  let t = (to||"").trim();
  if (t.startsWith("#")) t = t.slice(1);
  if (!t.startsWith("/")) t = "/"+t;
  return "#"+t;
}
function toHashValue(to:string){
  // то, что кладём в location.hash (без '#')
  let t = (to||"").trim();
  if (t.startsWith("#")) t = t.slice(1);
  if (!t.startsWith("/")) t = "/"+t;
  return t;
}

function pathToRegex(path:string){
  // поддержка :params и простого "*" (например "/*")
  const keys:string[]=[];
  let p = path.replace(/\/+$/,"") || "/";
  p = p.replace(/:[^/]+/g,(m)=>{ keys.push(m.slice(1)); return "([^/]+)"; });
  // очень простой wildcard: "*" -> ".*"
  p = p.replace(/\*/g,".*");
  const regex = new RegExp("^"+p+"$");
  return { regex, keys };
}

export function matchPath(pathname:string, path:string): Match | null {
  const nPathname = normalize(pathname);
  const nPath = normalize(path);
  const { regex, keys } = pathToRegex(nPath);
  const m = nPathname.match(regex);
  if(!m) return null;
  const params:Record<string,string>={};
  keys.forEach((k,i)=> params[k] = decodeURIComponent(m[i+1]));
  return { params, pathname: nPathname };
}

type RouterCtx = {
  pathname: string;             // "/catalog/.."
  search: string;               // "q=..." без '?'
  push: (to:string)=>void;      // push("/search?q=...")
  params: Record<string,string>;
};

const RouterContext = createContext<RouterCtx>({ pathname:"/", search:"", push:()=>{}, params:{} });
export function useRouter(){ return useContext(RouterContext); }

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: React.ReactNode;
};

/* >>> ИСПРАВЛЁННЫЙ Link: всегда даёт href вида "#/..." <<< */
export function Link({ to, children, className, onClick, ...rest }: LinkProps){
  return (
    <a
      href={toHashHref(to)}
      className={className}
      onClick={(e)=>{ onClick?.(e); }}
      {...rest}
    >{children}</a>
  );
}

function getHashFull(){
  // "#/path?query" -> "/path?query"
  const raw = location.hash.replace(/^#/,"");
  return raw || "/";
}

export function Router({ routes }:{ routes: Route[] }){
  const [full, setFull] = useState<string>(()=> getHashFull());
  useEffect(()=>{
    const onHash = ()=> setFull(getHashFull());
    addEventListener("hashchange", onHash);
    if(!location.hash) location.hash = "/"; // первая загрузка на главную
    return ()=> removeEventListener("hashchange", onHash);
  },[]);

  const pathname = normalize(full);
  const search = (full.split("?")[1] ?? "");

  const match = useMemo(()=>{
    for(const r of routes){
      const m = matchPath(pathname, r.path);
      if(m) return { route: r, params: m.params };
    }
    return null;
  },[pathname, routes]);

  /* >>> ИСПРАВЛЁННЫЙ push: принимает "/admin", "admin", "#/admin" <<< */
  const ctx:RouterCtx = { pathname, search, params: match?.params ?? {}, push: (to)=> { location.hash = toHashValue(to); } };

  return (
    <RouterContext.Provider value={ctx}>
      {match?.route.element ?? <div className="container"><h1>404</h1></div>}
    </RouterContext.Provider>
  );
}
