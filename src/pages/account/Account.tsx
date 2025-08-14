import React from "react";

export default function AccountPage(){
  const [tab,setTab] = React.useState<"profile"|"orders"|"addresses">("profile");
  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <h1>Личный кабинет</h1>
      <div className="navbar">
        <button className={"navbtn"+(tab==="profile"?" active":"")} onClick={()=>setTab("profile")}>Профиль</button>
        <button className={"navbtn"+(tab==="orders"?" active":"")} onClick={()=>setTab("orders")}>Заказы</button>
        <button className={"navbtn"+(tab==="addresses"?" active":"")} onClick={()=>setTab("addresses")}>Адреса</button>
      </div>
      {tab==="profile" && <section className="card" style={{padding:16,display:"grid",gap:8}}>
        <h2>Профиль</h2>
        <input className="input" placeholder="Имя"/>
        <input className="input" placeholder="Email"/>
        <button className="btn primary" style={{width:"fit-content"}}>Сохранить</button>
      </section>}
      {tab==="orders" && <section className="card" style={{padding:16}}>
        <h2>Заказы</h2>
        <p style={{color:"var(--muted)"}}>История заказов появится после интеграции с бекендом.</p>
      </section>}
      {tab==="addresses" && <section className="card" style={{padding:16,display:"grid",gap:8}}>
        <h2>Адреса</h2>
        <input className="input" placeholder="Город"/>
        <input className="input" placeholder="Улица, дом, кв."/>
        <button className="btn">Добавить адрес</button>
      </section>}
    </div>
  );
}
