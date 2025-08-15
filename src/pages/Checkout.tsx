import React from "react";
import { useCart } from "../store/store";
import { price } from "../utils/money";

export default function CheckoutPage(){
  const { total } = useCart();
  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <h1>Checkout</h1>
      <div className="grid" style={{gridTemplateColumns:"1fr 360px", gap:16}}>
        <form className="card" style={{padding:16,display:"grid",gap:12}}>
          <h2>Recipient Information</h2>
          <div className="form-row">
            <input className="input" placeholder="First Name"/>
            <input className="input" placeholder="Last Name"/>
          </div>
          <div className="form-row">
            <input className="input" placeholder="Phone"/>
            <input className="input" placeholder="Email"/>
          </div>
          <h2>Delivery Address</h2>
          <input className="input" placeholder="City"/>
          <div className="form-row">
            <input className="input" placeholder="Street"/>
            <input className="input" placeholder="House / Apt"/>
          </div>
          <h2>Payment</h2>
          <select className="select">
            <option>Card</option>
            <option>Cash on Delivery</option>
          </select>
          <button className="btn primary" type="button">Confirm Order</button>
        </form>
        <aside className="card" style={{padding:16}}>
          <h2>To Pay</h2>
          <div style={{fontSize:"1.5rem",fontWeight:800}}>{price(total)}</div>
          <p style={{color:"var(--muted)"}}>All data is demo. Payment/delivery integration is done on the backend.</p>
        </aside>
      </div>
    </div>
  );
}
