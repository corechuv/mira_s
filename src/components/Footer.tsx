import React from "react";
import { Link } from "../router";
import { Icon } from "../icons/Icon";

import cls from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className="container" style={{ padding: "28px 1rem", borderTop: "1px solid var(--border)", marginTop: 28, display: "grid", gap: 12 }}>
      <div className="logo"><span className="dot"></span><b>Mira</b></div>
      <div className="navbar">
        <Link to="/" className="navbtn">Home</Link>
        <Link to="/catalog" className="navbtn">Catalog</Link>
        <Link to="/account" className="navbtn">Account</Link>
        <Link to="/about" className="navbtn">About</Link>
      </div>
      <div className={cls.methods}>
        <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="cls.icon_paypal" aria-label="PayPal">
          <img src="paypal.png" alt="PayPal"  />
        </a>
        <a href="https://www.visa.com" target="_blank" rel="noopener noreferrer" className="cls.icon_visa" aria-label="Visa">
          <img src="visa.png" alt="Visa" />
        </a>
        <a href="https://www.mastercard.com" target="_blank" rel="noopener noreferrer" className="cls.icon_mastercard" aria-label="MasterCard">
          <img src="mastercard.png" alt="MasterCard" />
        </a>
      </div>
      <div className={cls.delivery}>
        <a href="https://www.dhl.com" target="_blank" rel="noopener noreferrer" className="cls.icon_dhl" aria-label="DHL">
          <img src="dhl.png" alt="DHL" />
        </a>
      </div>
      <div className={cls.social}>
        <a href="https://www.meta.com" target="_blank" rel="noopener noreferrer" className={`${cls.social__icon}`} aria-label="Meta">
          <img src="meta.png" alt="Meta" className={`${cls["social__icon--meta"]}`} />
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className={`${cls.social__icon}`} aria-label="Instagram">
          <img src="instagram.png" alt="Instagram" className={`${cls["social__icon--instagram"]}`} />
        </a>
        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className={`${cls.social__icon}`} aria-label="TikTok">
          <img src="tiktok_white.png" alt="TikTok" className={`${cls["social__icon--tiktok"]}`} />
        </a>
        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className={`${cls.social__icon}`} aria-label="YouTube">
          <img src="youtube_white.png" alt="YouTube" className={`${cls["social__icon--youtube"]}`} />
        </a>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <span className="badge">Deutschland</span>
        <span className="badge">Support: support@example.com</span>
      </div>
      <small style={{ color: "var(--muted)", marginTop: 30 }}>© {new Date().getFullYear()} Mira</small>
    </footer>
  );
}
