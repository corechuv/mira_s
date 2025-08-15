import React from "react";
import { useAuth } from "../store/auth";
import { listReviews, getMyReview, upsertMyReview, deleteMyReview, fetchProductStats } from "../api/reviews";
import type { Review } from "../api/reviews";

function Stars({ value, onChange, size=20, interactive=false }:{
  value:number; onChange?:(v:number)=>void; size?:number; interactive?:boolean;
}){
  const [hover, setHover] = React.useState<number>(0);
  const v = hover || value;
  return (
    <div style={{display:"inline-flex", gap:6}}>
      {[1,2,3,4,5].map(n=>(
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
             style={{cursor: interactive ? "pointer":"default", transition:"transform .15s", transform: hover===n? "scale(1.05)":"none"}}
             onMouseEnter={()=>interactive&&setHover(n)}
             onMouseLeave={()=>interactive&&setHover(0)}
             onClick={()=>interactive && onChange && onChange(n)}
             aria-label={`${n} star`}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill={n<=v? "var(--pink)": "none"} stroke={n<=v? "var(--pink)":"var(--border)"} strokeWidth="1.5"/>
        </svg>
      ))}
    </div>
  );
}

export default function Reviews({ productId }:{ productId:string }){
  const { session } = useAuth();
  const [list, setList] = React.useState<Review[]>([]);
  const [my, setMy] = React.useState<Review|null>(null);
  const [rating, setRating] = React.useState<number>(5);
  const [text, setText] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [avg, setAvg] = React.useState(0);
  const [count, setCount] = React.useState(0);

  async function loadAll(){
    const [r, mine, stats] = await Promise.all([
      listReviews(productId, 0, 20),
      getMyReview(productId),
      fetchProductStats(productId)
    ]);
    setList(r);
    setMy(mine||null);
    if(mine){ setRating(mine.rating); setText(mine.body||""); } else { setRating(5); setText(""); }
    setAvg(stats.rating||0);
    setCount(stats.rating_count||0);
  }
  React.useEffect(()=>{ loadAll().catch(console.error); },[productId]);

  async function submit(){
    setBusy(true); setMsg("");
    try{
      await upsertMyReview(productId, rating, text.trim());
      setMsg("Review saved");
      await loadAll();
    }catch(e:any){ setMsg(e?.message || "Failed to save review"); }
    setBusy(false);
  }
  async function remove(){
    if(!my) return;
    setBusy(true); setMsg("");
    try{ await deleteMyReview(my.id); setMsg("Review deleted"); await loadAll(); }
    catch(e:any){ setMsg(e?.message || "Failed to delete review"); }
    setBusy(false);
  }

  return (
    <section className="card" style={{padding:16, display:"grid", gap:16}}>
      <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"}}>
        <Stars value={Math.round(avg)} />
        <b>{avg.toFixed(1)}</b>
        <span className="muted">({count} reviews)</span>
      </div>

      {session ? (
        <div className="card" style={{padding:12, display:"grid", gap:10}}>
          <div><b>{my ? "Your Review" : "Leave a Review"}</b></div>
          <Stars value={rating} onChange={setRating} interactive size={24}/>
          <textarea className="input" rows={4} placeholder="Share your thoughts about the product…" value={text} onChange={e=>setText(e.target.value)} />
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            <button className="btn primary" onClick={submit} disabled={busy}>{my? "Update":"Submit"}</button>
            {my && <button className="btn" onClick={remove} disabled={busy}>Delete</button>}
            {msg && <small className="muted">{msg}</small>}
          </div>
        </div>
      ) : (
        <div className="badge">To leave a review, please log in.</div>
      )}

      <div style={{display:"grid", gap:8}}>
        {!list.length && <p className="muted">No reviews yet.</p>}
        {list.map(r=>(
          <article key={r.id} className="card" style={{padding:12, display:"grid", gap:6}}>
            <div style={{display:"flex", alignItems:"center", gap:8, justifyContent:"space-between"}}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <div style={{width:32, height:32, borderRadius:9999, background:"var(--bg-soft)", display:"grid", placeItems:"center"}}>
                  {(r.full_name?.[0] || "☺").toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:600}}>{r.full_name || "Customer"}</div>
                  <small className="muted">{new Date(r.created_at).toLocaleString()}</small>
                </div>
              </div>
              <Stars value={r.rating}/>
            </div>
            {r.body && <p style={{margin:0}}>{r.body}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
