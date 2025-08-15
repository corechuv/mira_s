import React from "react";
import { Link } from "../router";

export default function NotFound(){
  return (
    <div className="container" style={{display:"grid",gap:8}}>
      <h1>404 — page not found</h1>
      <Link to="/" className="btn">Go to Home</Link>
    </div>
  );
}
