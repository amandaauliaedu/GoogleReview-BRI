import { motion } from "framer-motion";
import { fmtPct } from "../utils/calculations";

export const KPICard = ({ label, value, unit, icon, i = 0, hint, onClick, active }) => (
  <motion.div className={`kpi${onClick ? " clk" : ""}${active ? " act" : ""}`} onClick={onClick} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
    <small>{label}</small>{icon && <span className="kico">{icon}</span>}<div>{value}{unit && <sub>{unit}</sub>}</div>{hint && <em>{hint}</em>}
  </motion.div>
);
export const ProgressBar = ({ value }) => (
  <div className="pb"><div className="track"><motion.div className={`fill ${value >= 100 ? "ok" : ""}`} initial={{ width: 0 }}
    animate={{ width: `${Math.min(value, 100)}%` }} transition={{ duration: 0.6 }} /></div><b>{fmtPct(value)}</b></div>
); // bar visual dibatasi 100%, angka tetap menampilkan nilai asli (mis. 140%)
export const Loading = () => <div className="card">{[1, 2, 3, 4].map((i) => <motion.div key={i} className="skel" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }} />)}</div>;
export const EmptyState = ({ error }) => <div className={`card empty ${error ? "err" : ""}`}>{error ? "Data gagal dimuat. Silakan coba kembali." : "Tidak ada data yang sesuai dengan filter."}</div>;
export const Page = ({ title, lead, children }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
    <h1>{title}</h1><p className="lead">{lead}</p>{children}</motion.div>
);

/* Tabel generik: kolom {key,label,render?,sortValue?}; sorting + pagination */
import { useState } from "react";
export function DataTable({ columns, rows, pageSize = 20, rowKey }) {
  const [sort, setSort] = useState({ k: null, d: 1 });
  const [page, setPage] = useState(0);
  const col = columns.find((c) => c.key === sort.k);
  const sorted = col ? [...rows].sort((a, b) => {
    const x = col.sortValue ? col.sortValue(a) : a[col.key], y = col.sortValue ? col.sortValue(b) : b[col.key];
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "id", { numeric: true })) * sort.d;
  }) : rows;
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize)), cur = Math.min(page, pages - 1);
  return (
    <>
      <div className="tw"><table><thead><tr>{columns.map((c) => (
        <th key={c.key} onClick={() => setSort({ k: c.key, d: sort.k === c.key ? -sort.d : 1 })} className="sortable">
          {c.label}{sort.k === c.key ? (sort.d > 0 ? " ▲" : " ▼") : ""}</th>))}</tr></thead>
        <tbody>{sorted.slice(cur * pageSize, (cur + 1) * pageSize).map((r, i) => (
          <tr key={rowKey ? rowKey(r) : i}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>))}</tbody></table></div>
      <div className="pager"><span>{sorted.length} baris • hal {cur + 1}/{pages}</span>
        <button disabled={cur === 0} onClick={() => setPage(cur - 1)}>‹ Prev</button>
        <button disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next ›</button></div>
    </>
  );
}
