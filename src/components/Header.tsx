import React from "react";
import { Icon } from "../icons/Icon";
import { Link, useRouter } from "../router";
import { useCart, useSearch } from "../store/store";
import MobileCatalog from "./MobileCatalog";
import { useScrollY } from "../utils/hooks";

import logo from '../assets/MIRA_transparent.png'

export default function Header(){
  const { push } = useRouter();
  const { state } = useCart();
  const { q, setQ } = useSearch();
  const [open, setOpen] = React.useState(false);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const scrolled = useScrollY(4);

  function onSubmit(e:React.FormEvent){ e.preventDefault(); push("/search?q="+encodeURIComponent(q)); }
  function onCatalogClick(){ setOpen(true); } // всегда мобильный каталог по запросу пользователя

  return (
    <header className={`header ${scrolled ? "is-scrolled":""}`}>
      <div className="container row" style={{justifyContent: isMobile ? "space-between" : "flex-start", padding: "1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>

        <button className="btn-h" aria-label="Каталог" onClick={onCatalogClick}>
          <Icon name="category"/>
        </button>
        <Link to="/" className="logo">
          <img src={logo} alt="Mira" className="logo-image" />
        </Link>
        </div>

        <form className="search" onSubmit={onSubmit}>
          <input className="input" placeholder="Поиск товаров..." value={q} onChange={e=>setQ(e.target.value)} aria-label="Поиск"/>
          <button className="" type="submit"><Icon name="search"/></button>
        </form>

        <nav className="actions">
          <Link to="/search" className="search-header btn-h" aria-label="Search"><Icon name="search"/></Link>
          <Link to="/wishlist" className="btn-h" aria-label="Избранное"><Icon name="heart"/></Link>
          <Link to="/compare" className="btn-h" aria-label="Сравнение"><Icon name="compare"/></Link>
          <Link to="/cart" className="btn-h header-cart-btn" aria-label="Корзина"><Icon name="cart"/> <span className="badge">{state.lines.length}</span></Link>
          <Link to="/account" className="btn-h" aria-label="Аккаунт"><Icon name="user"/></Link>
        </nav>
      </div>
      <MobileCatalog open={open} onClose={()=>setOpen(false)}/>
    </header>
  );
}
