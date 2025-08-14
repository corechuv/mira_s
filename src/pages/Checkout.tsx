import React from "react";
import { useCart } from "../store/store";
import { price } from "../utils/money";

export default function CheckoutPage(){
  const { total } = useCart();
  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <h1>Оформление заказа</h1>
      <div className="grid" style={{gridTemplateColumns:"1fr 360px", gap:16}}>
        <form className="card" style={{padding:16,display:"grid",gap:12}}>
          <h2>Данные получателя</h2>
          <div className="form-row">
            <input className="input" placeholder="Имя"/>
            <input className="input" placeholder="Фамилия"/>
          </div>
          <div className="form-row">
            <input className="input" placeholder="Телефон"/>
            <input className="input" placeholder="Email"/>
          </div>
          <h2>Адрес доставки</h2>
          <input className="input" placeholder="Город"/>
          <div className="form-row">
            <input className="input" placeholder="Улица"/>
            <input className="input" placeholder="Дом / Кв"/>
          </div>
          <h2>Оплата</h2>
          <select className="select">
            <option>Карта</option>
            <option>При получении</option>
          </select>
          <button className="btn primary" type="button">Подтвердить заказ</button>
        </form>
        <aside className="card" style={{padding:16}}>
          <h2>К оплате</h2>
          <div style={{fontSize:"1.5rem",fontWeight:800}}>{price(total)}</div>
          <p style={{color:"var(--muted)"}}>Все данные — демо. Подключение оплаты/доставки делается на бекенде.</p>
        </aside>
      </div>
    </div>
  );
}
