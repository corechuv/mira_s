import React, { createContext, useContext, useMemo, useReducer } from "react";
import { useLocalStorage } from "../utils/hooks";
import type { ProductUI as Product } from "../api/types";

type Theme = "light" | "dark" | "pink";
const ThemeCtx = createContext<{ theme: Theme; setTheme: (t:Theme)=>void }>({ theme:"light", setTheme:()=>{} });

export function ThemeProvider({ children }:{ children:React.ReactNode }){
  const [theme, setTheme] = useLocalStorage<Theme>("theme","light");
  React.useEffect(()=>{ document.documentElement.setAttribute("data-theme", theme); },[theme]);
  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>
}
export const useTheme = ()=> useContext(ThemeCtx);

type Line = { id:string; qty:number; price:number; title:string; slug:string; image?:string };
type CartState = { lines: Line[] };
type CartAction = { type:"add", product:Product, qty?:number } | { type:"remove", id:string } | { type:"setQty", id:string, qty:number } | { type:"clear" };

function cartReducer(state:CartState, action:CartAction):CartState{
  switch(action.type){
    case "add":{
      const ex = state.lines.find(l=>l.id===action.product.id);
      if(ex){ ex.qty += action.qty ?? 1; return { lines:[...state.lines] }; }
      return { lines:[...state.lines, { id:action.product.id, qty:action.qty ?? 1, price:action.product.price, title:action.product.title, slug:action.product.slug, image:action.product.images[0] }] };
    }
    case "remove": return { lines: state.lines.filter(l=>l.id!==action.id) };
    case "setQty": return { lines: state.lines.map(l=> l.id===action.id ? { ...l, qty: Math.max(1, action.qty) } : l ) };
    case "clear": return { lines:[] };
  }
}

const CartCtx = createContext<{ state:CartState; dispatch:React.Dispatch<CartAction>; total:number }>({ state:{lines:[]}, dispatch:()=>{}, total:0 });

export function CartProvider({ children }:{ children:React.ReactNode }){
  const [persist, setPersist] = useLocalStorage<CartState>("cart",{ lines:[] });
  const [state, dispatch] = useReducer(cartReducer, persist);
  React.useEffect(()=> setPersist(state),[state]);
  const total = useMemo(()=> state.lines.reduce((s,l)=> s + l.price*l.qty, 0), [state]);
  return <CartCtx.Provider value={{ state, dispatch, total }}>{children}</CartCtx.Provider>;
}
export const useCart = ()=> useContext(CartCtx);

type IdState = { ids: string[] };
function idsReducer(state:IdState, action:{ type:"toggle"|"remove"|"clear", id?:string }){
  if(action.type==="clear") return { ids:[] };
  if(action.type==="remove") return { ids: state.ids.filter(i=>i!==action.id) };
  const exists = state.ids.includes(action.id!);
  return { ids: exists ? state.ids.filter(i=>i!==action.id) : [...state.ids, action.id!] };
}

const WishCtx = createContext<{ state:IdState; dispatch:React.Dispatch<any> }>({ state:{ids:[]}, dispatch:()=>{} });
export function WishlistProvider({ children }:{ children:React.ReactNode }){
  const [persist, setPersist] = useLocalStorage<IdState>("wishlist",{ ids:[] });
  const [state, dispatch] = React.useReducer(idsReducer, persist);
  React.useEffect(()=> setPersist(state),[state]); 
  return <WishCtx.Provider value={{ state, dispatch }}>{children}</WishCtx.Provider>;
}
export const useWishlist = ()=> useContext(WishCtx);

const CompareCtx = createContext<{ state:IdState; dispatch:React.Dispatch<any> }>({ state:{ids:[]}, dispatch:()=>{} });
export function CompareProvider({ children }:{ children:React.ReactNode }){
  const [persist, setPersist] = useLocalStorage<IdState>("compare",{ ids:[] });
  const [state, dispatch] = React.useReducer(idsReducer, persist);
  React.useEffect(()=> setPersist(state),[state]); 
  return <CompareCtx.Provider value={{ state, dispatch }}>{children}</CompareCtx.Provider>;
}
export const useCompare = ()=> useContext(CompareCtx);

const ViewedCtx = createContext<{ ids:string[], push:(id:string)=>void }>({ ids:[], push:()=>{} });
export function ViewedProvider({ children }:{ children:React.ReactNode }){
  const [ids, setIds] = useLocalStorage<string[]>("viewed",[]);
  function push(id:string){ setIds(prev => [id, ...prev.filter(p=>p!==id)].slice(0,20)); }
  return <ViewedCtx.Provider value={{ ids, push }}>{children}</ViewedCtx.Provider>;
}
export const useViewed = ()=> useContext(ViewedCtx);

const SearchCtx = createContext<{ q:string; setQ:(s:string)=>void }>({ q:"", setQ:()=>{} });
export function SearchProvider({ children }:{ children:React.ReactNode }){
  const [q,setQ] = React.useState("");
  return <SearchCtx.Provider value={{ q, setQ }}>{children}</SearchCtx.Provider>;
}
export const useSearch = ()=> useContext(SearchCtx);
