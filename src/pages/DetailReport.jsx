import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Page, DataTable, ProgressBar, KPICard } from "../components/ui";
import { groupByUker, groupByDate, groupByMonth, TARGET, pct } from "../utils/calculations";
import { rosterFilter } from "../utils/roster";
import { exportExcel } from "../utils/exportExcel";

const CATS = {
  all: { label: "Total Uker", file: "detail-uker-semua", test: () => true },
  done: { label: "Sudah Target", file: "detail-uker-sudah-target", test: (r) => r.total >= TARGET },
  not: { label: "Belum Target", file: "detail-uker-belum-target", test: (r) => r.total < TARGET },
  zero: { label: "Belum Ada Input", file: "detail-uker-belum-ada-input", test: (r) => r.total === 0 },
};
export default function DetailReport({ rows, filter }) {
  const [mode, setMode] = useState("daily");
  const [cat, setCat] = useState("all");
  const list = useMemo(() => {
    const counts = Object.fromEntries(groupByUker(rows).map((u) => [u.key, u]));
    const sub = rosterFilter(filter), keys = new Set(sub.map((u) => u.key));
    const base = sub.map((u) => { const c = counts[u.key]; const t = c?.total || 0;
      return { key: u.key, bc: u.boCode, bo: u.bo, kode: u.kode, nama: u.nama, jenis: u.jenis, total: t, daily: c?.daily || {}, monthly: c?.monthly || {}, target: TARGET, pct: pct(t, TARGET) }; });
    const extra = Object.values(counts).filter((c) => !keys.has(c.key) && (!filter.bo || c.bo === filter.bo)).map((c) => ({ ...c, bc: "-" }));
    return [...base, ...extra];
  }, [rows, filter]);
  const view = useMemo(() => list.filter(CATS[cat].test), [list, cat]);
  const cols = useMemo(() => (mode === "daily" ? groupByDate(rows) : groupByMonth(rows)).map((x) => x.label), [rows, mode]);
  const val = (r, c) => (mode === "daily" ? r.daily : r.monthly)[c] || 0;
  const columns = [
    { key: "bc", label: "Branch Code" }, { key: "bo", label: "Branch Office" }, { key: "kode", label: "Kode Uker" }, { key: "nama", label: "Nama Uker" }, { key: "jenis", label: "Jenis" },
    ...cols.map((c) => ({ key: c, label: mode === "daily" ? c.slice(8) + "/" + c.slice(5, 7) : c, sortValue: (r) => val(r, c), render: (r) => val(r, c) })),
    { key: "total", label: "Total Input" }, { key: "target", label: "Target" }, { key: "pct", label: "Pencapaian", render: (r) => <ProgressBar value={r.pct} /> },
  ];
  const dl = () => exportExcel(`${CATS[cat].file}.xlsx`, ["Branch Code", "Branch Office", "Kode Uker", "Nama Uker", "Jenis", ...cols, "Total Input", "Target", "Pencapaian (%)"],
    view.map((r) => [r.bc, r.bo, r.kode, r.nama, r.jenis, ...cols.map((c) => val(r, c)), r.total, r.target, Number(r.pct.toFixed(1))]), CATS[cat].label);
  return (
    <Page title="Detail Report Per Unit Kerja" lead="Seluruh BO dan uker ditampilkan yang belum terdapat inputan bernilai 0. Target 100% dengan 5 inputan.">
      <div className="kpis">{Object.entries(CATS).map(([k, c], i) =>
        <KPICard key={k} label={c.label} value={list.filter(c.test).length} i={i} active={cat === k} onClick={() => setCat(k)} hint="Klik untuk menampilkan" />)}</div>
      <div className="bar"><select value={mode} onChange={(e) => setMode(e.target.value)}><option value="daily">Tampilan Harian</option><option value="monthly">Tampilan Bulanan</option></select>
        <span className="chip">{CATS[cat].label}: {view.length} uker</span>
        <button className="ghost" disabled={!view.length} onClick={dl}><Download size={13} style={{ verticalAlign: -2 }} /> Unduh Excel ({CATS[cat].label})</button></div>
      <div className="card glass"><DataTable key={cat} columns={columns} rows={view} rowKey={(r) => r.key} pageSize={50} /></div>
    </Page>
  );
}
