import React from "react";
import { createPortal } from "react-dom";
import { listCategoriesTree } from "../api/categories";
import { Icon } from "../icons/Icon";
import { Link } from "../router";
import ThemeToggle from "./ThemeToggle";

export default function MobileCatalog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cats, setCats] = React.useState<any[]>([]);
  React.useEffect(() => { if (open) listCategoriesTree().then(setCats).catch(console.error); }, [open]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const node = (
    <div className={"drawer open"} aria-hidden={!open} role="dialog" aria-modal="true">
      <div className="backdrop" onClick={onClose} />
      <aside className="panel" role="menu" aria-label="Каталог">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="logo"><span className="dot"></span><span>Каталог</span></div>
          <button className="btn-h icon" onClick={onClose}><Icon name="close" /></button>
        </div>
        <nav style={{ display: "grid", gap: 8 }}>
          {(cats || []).map((l1: any) => (
            <details key={l1.slug} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 8 }}>
              <summary style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <b>{l1.title}</b>
              </summary>
              <div style={{ paddingLeft: 8, display: "grid", gap: 6, marginTop: 8 }}>
                {l1.children?.map((l2: any) => (
                  <details key={l2.slug} style={{ padding: 6 }}>
                    <summary style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="chevron-down" />{l2.title}
                    </summary>
                    <div style={{ padding: "6px 0 0 22px", display: "grid", gap: 6 }}>
                      {l2.children?.map((l3: any) => (
                        <Link key={l3.slug} to={`/catalog/${l1.slug}/${l2.slug}/${l3.slug}`} className="navbtn" onClick={onClose}>
                          {l3.title}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
          <ThemeToggle />
        </nav>
      </aside>
    </div>
  );

  return createPortal(node, document.body);
}
