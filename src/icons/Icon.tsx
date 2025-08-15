import React from "react";

type IconName =
  | "menu" | "close" | "search" | "cart" | "user" | "heart" | "compare"
  | "sun" | "moon" | "pink" | "category" | "filter" | "sort" | "star" | "trash" | "chevron-right" | "chevron-down" | "home";

export function Icon({ name, size = 18, stroke = 1.5 }: { name: IconName; size?: number; stroke?: number }) {
  const s = { width: size, height: size, strokeWidth: stroke, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as any;
  switch (name) {
    case "menu": return <svg {...s} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor"/></svg>;
    case "close": return <svg {...s} viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor"/></svg>;
    case "search": return <svg {...s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="currentColor"/><path d="M20 20l-3.5-3.5" stroke="currentColor"/></svg>;
    case "cart": return <svg {...s} viewBox="0 0 24 24"><circle cx="9" cy="20" r="1" fill="currentColor"/><circle cx="17" cy="20" r="1" fill="currentColor"/><path d="M3 4h3l2.4 10.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.6L22 7H7" stroke="currentColor"/></svg>;
    case "user": return <svg {...s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor"/><circle cx="12" cy="7" r="3" stroke="currentColor"/></svg>;
    case "heart": return <svg {...s} viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" stroke="currentColor"/></svg>;
    case "compare": return <svg {...s} viewBox="0 0 24 24"><path d="M4 20V8M8 20V4M16 20V8M20 20V4" stroke="currentColor"/></svg>;
    case "sun": return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" stroke="currentColor"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 5L19 6.5M5 19l-1.5 1.5M20.5 19L19 17.5" stroke="currentColor"/></svg>;
    case "moon": return <svg {...s} viewBox="0 0 24 24"><path d="M21 12.3A9 9 0 1 1 11.7 3a7 7 0 0 0 9.3 9.3z" stroke="currentColor"/></svg>;
    case "pink": return <svg {...s} viewBox="0 0 24 24"><path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9z" stroke="currentColor"/><path d="M7 13c2 2 8 2 10-2" stroke="currentColor"/></svg>;
    case "category": return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor"/></svg>;
    case "filter": return <svg {...s} viewBox="0 0 24 24"><path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor"/></svg>;
    case "sort": return <svg {...s} viewBox="0 0 24 24"><path d="M8 7h8M10 12h6M12 17h4" stroke="currentColor"/></svg>;
    case "star": return <svg {...s} viewBox="0 0 24 24"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.6l6.2-.9L12 3z" stroke="currentColor"/></svg>;
    case "trash": return <svg {...s} viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke="currentColor"/></svg>;
    case "chevron-right": return <svg {...s} viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor"/></svg>;
    case "chevron-down": return <svg {...s} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor"/></svg>;
    case "home": return <svg {...s} viewBox="0 0 24 24"><path d="M3 12l9-8 9 8v8a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z" stroke="currentColor"/></svg>;
    default: return null;
  }
}
