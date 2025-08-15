import React from "react";
import { Link } from "../router";
import { Icon } from "../icons/Icon";

export default function Footer(){
  return (
    <footer className="container" style={{padding:"28px 0",borderTop:"1px solid var(--border)",marginTop:28,display:"grid",gap:12}}>
      <div className="logo"><span className="dot"></span><b>Mira</b></div>
      <div className="navbar">
        <Link to="/" className="navbtn">Главная</Link>
        <Link to="/catalog" className="navbtn">Каталог</Link>
        <Link to="/account" className="navbtn">Личный кабинет</Link>
        <Link to="/about" className="navbtn">О нас</Link>
      </div>
      <small style={{color:"var(--muted)"}}>© {new Date().getFullYear()} Mira</small>
      <div style={{display:"flex",gap:8}}>
        <span className="badge">Deutschland</span>
        <span className="badge">Support: support@example.com</span>
      </div>
    </footer>
  );
}
