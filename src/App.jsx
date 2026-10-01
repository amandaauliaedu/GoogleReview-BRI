import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Home as HomeIcon, Radio, ClipboardList, Building2, BarChart3 } from "lucide-react";
import Navbar from "./components/Navbar";
import FilterBar from "./components/FilterBar";
import { Loading, EmptyState } from "./components/ui";
import { useMaster } from "./utils/useMaster";
import { groupByBO } from "./utils/calculations";
import { exportExcel } from "./utils/exportExcel";
import Home from "./pages/Home";
import MasterData from "./pages/MasterData";
import DetailReport from "./pages/DetailReport";
import ReportPerBO from "./pages/ReportPerBO";
import DataAnalyst from "./pages/DataAnalyst";

const PAGES = [
  { id: "home", label: "Home", Icon: HomeIcon, C: Home },
  { id: "master", label: "Live Response", Icon: Radio, C: MasterData },
  { id: "detail", label: "Detail Uker", Icon: ClipboardList, C: DetailReport },
  { id: "bo", label: "Report per BO", Icon: Building2, C: ReportPerBO },
  { id: "analyst", label: "Data Analyst", Icon: BarChart3, C: DataAnalyst },
];
export default function App() {
  const [p, setP] = useState("home");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const m = useMaster();
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("theme", theme); }, [theme]);
  const Cur = PAGES.find((x) => x.id === p).C;
  const bos = useMemo(() => groupByBO(m.all), [m.all]);
  const download = () => exportExcel("report-pengisian-google-review-per-bo.xlsx",
    ["Branch Code", "Branch Office", "Jumlah KK/KCP", "Jumlah Unit", "Total Input", "Target", "Persentase (%)"],
    bos.map((b) => [b.bc, b.bo, b.nKK, b.nUnit, b.total, b.target, b.pct.toFixed(1)]));
  return (
    <>
      <div className="bg"><i className="b1" /><i className="b2" /><i className="b3" /></div>
      <Navbar pages={PAGES} current={p} onChange={setP} theme={theme} toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} onDownload={download} />
      <main className="wrap">
        {p !== "home" && <FilterBar all={m.all} showReset={p !== "master" && p !== "detail"} filter={m.filter} setFilter={m.setFilter} reload={m.reload} at={m.at} />}
        {m.loading ? <Loading /> : m.error && !m.all.length ? <EmptyState error /> :
          <AnimatePresence mode="wait"><Cur key={p} rows={p === "home" ? m.all : m.rows} filter={m.filter} labels={m.labels} go={setP} onDownload={download} /></AnimatePresence>}
      </main>
    </>
  );
}
