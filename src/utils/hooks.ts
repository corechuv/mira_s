import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T){
  const [val, setVal] = useState<T>(() => {
    try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : initial; }
    catch{ return initial; }
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} },[key,val]);
  return [val, setVal] as const;
}

export function useDebounced<T>(value:T, delay=300){
  const [v,setV]=useState(value);
  useEffect(()=>{ const t=setTimeout(()=>setV(value),delay); return ()=>clearTimeout(t); },[value,delay]);
  return v;
}

export function useEvent<K extends keyof WindowEventMap>(name:K, handler:(ev:WindowEventMap[K])=>void){
  const ref=useRef(handler);
  useEffect(()=>{ ref.current=handler; },[handler]);
  useEffect(()=>{
    const h=(e:any)=>ref.current(e);
    addEventListener(name,h); return ()=>removeEventListener(name,h);
  },[name]);
}

/** следим за scrollY > threshold */
export function useScrollY(threshold=4){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const onScroll=()=> setScrolled(window.scrollY>threshold);
    onScroll();
    addEventListener("scroll",onScroll,{passive:true});
    return ()=> removeEventListener("scroll",onScroll);
  },[threshold]);
  return scrolled;
}

/** IntersectionObserver: вешает .reveal/.in на элемент для анимации появления */
export function useReveal<T extends HTMLElement>(opts?: {threshold?:number}){
  const ref=useRef<T|null>(null);
  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    el.classList.add("reveal");
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting) el.classList.add("in");
        else el.classList.remove("in");
      });
    },{threshold: opts?.threshold ?? 0.1});
    io.observe(el);
    return ()=> io.disconnect();
  },[opts?.threshold]);
  return ref;
}
