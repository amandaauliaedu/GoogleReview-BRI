import { useMemo, useState } from "react";
import { Page, DataTable, ProgressBar, KPICard } from "../components/ui";
import { groupByUker, groupByDate, groupByMonth, TARGET, pct } from "../utils/calculations";
import { rosterFilter } from "../utils/roster";
import { exportCsv } from "../utils/exportCsv";

export default function DetailReport({ rows, filter }) {
  const [mode, setMode] = useState("daily");
  const list = useMemo(() => {
    const counts = Object.fromEntries(groupByUker(rows).map((u) => [u.key, u]));
    const sub = rosterFilter(filter), keys = new Set(sub.map((u) => u.key));
    const base = sub.map((u) => { const c = counts[u.key]; const t = c?.total || 0;
      return { key: u.key, bc: u.boCode, bo: u.bo, kode: u.kode, nama: u.nama, jenis: u.jenis, total: t, daily: c?.daily || {}, monthly: c?.monthly || {}, target: TARGET, pct: pct(t, TARGET) }; });
    const extra = Object.values(counts).filter((c) => !keys.has(c.key) && (!filter.bo || c.bo === filter.bo)).map((c) => ({ ...c, bc: "-", jenis: c.jenis }));
    return [...base, ...extra];
  }, [rows, filter]);
  const cols = useMemo(() => (mode === "daily" ? groupByDate(rows) : groupByMonth(rows)).map((x) => x.label), [rows, mode]);
  const val = (r, c) => (mode === "daily" ? r.daily : r.monthly)[c] || 0;
  const columns = [
    { key: "bc", label: "Branch Code" }, { key: "bo", label: "Branch Office" }, { key: "kode", label: "Kode Uker" }, { key: "nama", label: "Nama Uker" }, { key: "jenis", label: "Jenis" },
    ...cols.map((c) => ({ key: c, label: mode === "daily" ? c.slice(8) + "/" + c.slice(5, 7) : c, sortValue: (r) => val(r, c), render: (r) => val(r, c) })),
    { key: "total", label: "Total Input" }, { key: "target", label: "Target" }, { key: "pct", label: "Pencapaian", render: (r) => <ProgressBar value={r.pct} /> },
  ];
  const done = list.filter((r) => r.total >= TARGET).length;
  const dl = () => exportCsv("detail-report-per-uker.csv", ["Branch Code", "Branch Office", "Kode Uker", "Nama Uker", "Jenis", ...cols, "Total Input", "Target", "Pencapaian (%)"],
    list.map((r) => [r.bc, r.bo, r.kode, r.nama, r.jenis, ...cols.map((c) => val(r, c)), r.total, r.target, r.pct.toFixed(1)]));
  return (
    <Page title="Detail Report Per Unit Kerja" lead="Seluruh BO dan uker ditampilkan; yang belum ada input bernilai 0. Target 5 input = 100%.">
      <div className="kpis">{[["Total Uker", list.length], ["Sudah Target", done], ["Belum Target", list.length - done], ["Belum Ada Input", list.filter((r) => !r.total).length]].map(([l, v], i) => <KPICard key={l} label={l} value={v} i={i} />)}</div>
      <div className="bar"><select value={mode} onChange={(e) => setMode(e.target.value)}><option value="daily">Tampilan Harian</option><option value="monthly">Tampilan Bulanan</option></select>
        <button className="ghost" onClick={dl}>⬇ Unduh CSV</button></div>
      <div className="card glass"><DataTable columns={columns} rows={list} rowKey={(r) => r.key} pageSize={50} /></div>
    </Page>
  );
}
