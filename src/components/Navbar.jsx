import { motion } from "framer-motion";
import { Sun, Moon, Wifi, Download } from "lucide-react";

export default function Navbar({ pages, current, onChange, theme, toggleTheme, onDownload }) {
  return (
    <header className="topbar">
      <div className="topin">
        <div className="logo" onClick={() => onChange("home")}>
          <span className="lg">RO</span>
          <div><b>BRI Region 12 Surabaya</b><small>OPERATION, SERVICE, AND E-CHANNEL (OSE)</small></div>
        </div>
        <nav className="pills">
          {pages.map(({ id, label, Icon }) => (
            <button key={id} className={current === id ? "on" : ""} onClick={() => onChange(id)}>
              {current === id && <motion.span layoutId="pill" className="pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="pi"><Icon size={15} />{label}</span>
            </button>))}
        </nav>
        <div className="tools">
          <span className="live"><Wifi size={13} />LIVE</span>
          <button className="icon" title="Unduh Report (CSV)" onClick={onDownload}><Download size={16} /></button>
          <button className="icon" title="Ganti tema" onClick={toggleTheme}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </div>
    </header>
  );
}
