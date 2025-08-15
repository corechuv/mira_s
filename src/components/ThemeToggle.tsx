import "react";
import { useTheme } from "../store/store";
import { Icon } from "../icons/Icon";

export default function ThemeToggle(){
  const { theme, setTheme } = useTheme();
  const next = (t:string)=>()=> setTheme(t as any);
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button className={"btn icon"+(theme==="light"?" primary":"")} onClick={next("light")} title="Light"><Icon name="sun"/></button>
      <button className={"btn icon"+(theme==="dark"?" primary":"")} onClick={next("dark")} title="Dark"><Icon name="moon"/></button>
      <button className={"btn icon"+(theme==="pink"?" primary":"")} onClick={next("pink")} title="Pink"><Icon name="pink"/></button>
    </div>
  );
}
