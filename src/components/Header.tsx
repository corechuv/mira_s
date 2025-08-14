import React from "react";
import { Icon } from "../icons/Icon";
import { Link, useRouter } from "../router";
import ThemeToggle from "./ThemeToggle";
import { useCart, useSearch } from "../store/store";
import MobileCatalog from "./MobileCatalog";
import { useScrollY } from "../utils/hooks";

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
      <div className="container row">
        <button className="btn" aria-label="Каталог" onClick={onCatalogClick}>
          <Icon name="category"/> Каталог
        </button>
        <Link to="/" className="logo"><span className="dot"></span><span>Marketplace</span></Link>

        <form className="search" onSubmit={onSubmit}>
          <input className="input" placeholder="Поиск товаров..." value={q} onChange={e=>setQ(e.target.value)} aria-label="Поиск"/>
          <button className="btn" type="submit"><Icon name="search"/> Найти</button>
        </form>

        <nav className="actions">
          <Link to="/wishlist" className="btn icon" aria-label="Избранное"><Icon name="heart"/></Link>
          <Link to="/compare" className="btn icon" aria-label="Сравнение"><Icon name="compare"/></Link>
          <Link to="/cart" className="btn" aria-label="Корзина"><Icon name="cart"/> <span className="badge">{state.lines.length}</span></Link>
          <Link to="/account" className="btn icon" aria-label="Аккаунт"><Icon name="user"/></Link>
          <ThemeToggle/>
        </nav>
      </div>
      <MobileCatalog open={open} onClose={()=>setOpen(false)}/>
    </header>
  );
}
