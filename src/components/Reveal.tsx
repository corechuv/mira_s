import React from "react";
import { useReveal } from "../utils/hooks";

export default function Reveal({ children, anim="fade-up", className }:{ children:React.ReactNode; anim?: "fade-up"|"zoom-in"|"slide-left"; className?: string }){
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`reveal ${className||""}`} data-anim={anim}>{children}</div>;
}
