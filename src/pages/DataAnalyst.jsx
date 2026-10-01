import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area, Line } from "recharts";
import { Page, KPICard, EmptyState, ProgressBar } from "../components/ui";
import { groupByBO, groupByUker, groupByDate, groupByMonth, groupByCount, uniqueCount, pct, fmtPct } from "../utils/calculations";
import { rosterFilter } from "../utils/roster";

const COLORS = ["#3b8cff", "#f5a300", "#12c38b", "#ff5d63", "#8b7cff", "#22c8de"];
const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />;
const fmtD = (d) => d.split("-").reverse().join("/");

/* Kartu grafik dengan pilihan tanggal sendiri */
function Panel({ title, rows, dates, h = 260, plain, children }) {
  const [d, setD] = useState("");
  const sub = useMemo(() => (d ? rows.filter((r) => r.date === d) : rows), [rows, d]);
  return (
    <div className="card glass">
      <div className="chead"><b>{title}</b>
        <select value={d} onChange={(e) => setD(e.target.value)}><option value="">Semua Tanggal</option>{dates.map((x) => <option key={x} value={x}>{fmtD(x)}</option>)}</select></div>
      {plain ? children(sub) : <div style={{ height: h }}><ResponsiveContainer>{children(sub)}</ResponsiveContainer></div>}
    </div>
  );
}
const Chart = ({ title, children, h = 260 }) => <div className="card glass"><b>{title}</b><div style={{ height: h, marginTop: 8 }}><ResponsiveContainer>{children}</ResponsiveContainer></div></div>;

export default function DataAnalyst({ rows, filter }) {
  const d = useMemo(() => {
    const bos = groupByBO(rows, filter), ukers = groupByUker(rows);
    const total = bos.reduce((a, b) => a + b.total, 0), target = bos.reduce((a, b) => a + b.target, 0);
    return { bos, ukers, total, target, daily: groupByDate(rows), monthly: groupByMonth(rows),
      ok: ukers.filter((u) => u.pct >= 100).length, nUker: rosterFilter(filter).length };
  }, [rows, filter]);
  if (!rows.length) return <Page title="Data Analyst" lead=""><EmptyState /></Page>;
  const dates = d.daily.map((x) => x.label);
  const by = (g) => uniqueCount(rows.filter((r) => r.group === g), (r) => r.ukerKey);
  const cum = d.daily.reduce((a, x, i) => [...a, { label: x.label, value: x.value, kum: (a[i - 1]?.kum || 0) + x.value }], []);
  const ach = d.bos.map((b) => ({ ...b, label: b.bo, pctR: Math.round(b.pct) }));
  const rank0 = [...d.bos].sort((a, b) => b.total - a.total);
  const top = d.daily.reduce((a, x) => (x.value > (a?.value ?? -1) ? x : a), null);
  const hmUker = [...d.ukers].sort((a, b) => b.total - a.total).slice(0, 15);
  const gap = Math.max(d.target - d.total, 0);
  return (
    <Page title="Data Analyst" lead="Eksplorasi visual. Angka dihitung dari data aktual dan mengikuti filter di atas; grafik bertanda pilihan tanggal punya filter tanggal sendiri.">
      <div className="kpis">{[["Total Response", d.total], ["Total BO", d.bos.length], ["Total KK/KCP", by("KK/KCP")], ["Total Unit", by("Unit")],
        ["Average Response / Hari", d.daily.length ? (d.total / d.daily.length).toFixed(1) : 0], ["Total Target", d.target], ["Total Actual", d.total], ["Achievement", fmtPct(pct(d.total, d.target))]]
        .map(([l, v], i) => <KPICard key={l} label={l} value={v} i={i} />)}</div>

      <div className="grid2">
        <Chart title="1. Response per Tanggal"><BarChart data={d.daily}>{grid}<XAxis dataKey="label" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="value" name="Response" fill={COLORS[0]} radius={[4, 4, 0, 0]} /></BarChart></Chart>
        <Chart title="2. Response per Bulan"><BarChart data={d.monthly}>{grid}<XAxis dataKey="label" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="value" name="Response" fill={COLORS[1]} radius={[4, 4, 0, 0]} /></BarChart></Chart>

        <Panel title="3. Response per BO" rows={rows} dates={dates} h={560}>{(sub) => {
          const data = groupByBO(sub, filter);
          return <BarChart data={data} layout="vertical" margin={{ left: 40 }}>{grid}<XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="bo" width={130} fontSize={11} interval={0} /><Tooltip /><Bar dataKey="total" name="Response" fill={COLORS[0]} radius={[0, 4, 4, 0]} /></BarChart>; }}</Panel>
        <Panel title="4. Top 10 Unit Kerja" rows={rows} dates={dates} h={560}>{(sub) => {
          const data = groupByCount(sub, (r) => r.nama).slice(0, 10);
          return <BarChart data={data} layout="vertical" margin={{ left: 40 }}>{grid}<XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="label" width={140} fontSize={11} interval={0} /><Tooltip /><Bar dataKey="value" name="Response" fill={COLORS[2]} radius={[0, 4, 4, 0]} /></BarChart>; }}</Panel>

        <Panel title="5. Target vs Actual per BO" rows={rows} dates={dates} h={300}>{(sub) => {
          const data = groupByBO(sub, filter);
          return <BarChart data={data}>{grid}<XAxis dataKey="bo" fontSize={10} interval={0} angle={-35} textAnchor="end" height={90} /><YAxis fontSize={11} /><Tooltip /><Legend verticalAlign="top" /><Bar dataKey="target" name="Target" fill="#9db4d9" /><Bar dataKey="total" name="Actual" fill={COLORS[0]} /></BarChart>; }}</Panel>
        <Chart title="6. Achievement % per BO" h={300}><BarChart data={ach}>{grid}<XAxis dataKey="label" fontSize={10} interval={0} angle={-35} textAnchor="end" height={90} /><YAxis unit="%" fontSize={11} /><Tooltip formatter={(v) => `${v}%`} /><Bar dataKey="pctR" name="Achievement" radius={[4, 4, 0, 0]}>{ach.map((a, i) => <Cell key={i} fill={a.pct >= 100 ? COLORS[2] : COLORS[0]} />)}</Bar></BarChart></Chart>

        <Panel title="7. Distribusi Jenis Uker" rows={rows} dates={dates}>{(sub) => {
          const data = groupByCount(sub, (r) => r.jenis || "-");
          return <PieChart><Pie data={data} dataKey="value" nameKey="label" outerRadius={90} label>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>; }}</Panel>
        <Chart title="8. Trend Harian & Kumulatif"><AreaChart data={cum}>{grid}<XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend /><Area dataKey="kum" name="Kumulatif" fill={COLORS[0]} fillOpacity={0.15} stroke={COLORS[0]} /><Line dataKey="value" name="Harian" stroke={COLORS[1]} /></AreaChart></Chart>
      </div>

      <div className="grid2">
        <Panel title="9. Ranking BO berdasarkan Total Input" rows={rows} dates={dates} plain>{(sub) => {
          const rk = [...groupByBO(sub, filter)].sort((a, b) => b.total - a.total);
          return <ol className="rank">{rk.map((b, i) => <li key={b.bo}><small>{i + 1}.</small><span>{b.bo}</span><b style={{ width: 40 }}>{b.total}</b><ProgressBar value={b.pct} /></li>)}</ol>; }}</Panel>
        <div className="card glass"><b>10. Heatmap Tanggal × Uker (top 15)</b><div className="tw" style={{ maxHeight: 340, marginTop: 8 }}>
          {hmUker.map((u) => <div key={u.key} className="hmrow"><span title={u.key}>{u.nama}</span>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${dates.length},1fr)`, gap: 2, flex: 1 }}>
              {dates.map((dt) => { const n = u.daily[dt] || 0; return <i key={dt} title={`${u.nama} • ${fmtD(dt)}: ${n}`} style={{ opacity: n ? 0.2 + Math.min(n / 5, 0.8) : 0.06 }} />; })}</div></div>)}</div></div>
      </div>

      <div className="card glass insight"><b>Insight</b><ul>
        <li>Total response periode terpilih: <b>{d.total.toLocaleString("id-ID")}</b> dari <b>{d.nUker}</b> uker.</li>
        <li>Uker mencapai target (≥5 input): <b>{d.ok}</b> • belum mencapai: <b>{d.nUker - d.ok}</b>.</li>
        <li>Achievement keseluruhan: <b>{fmtPct(pct(d.total, d.target))}</b> • gap ke target: <b>{gap}</b> input.</li>
        {top && <li>Hari tertinggi: <b>{fmtD(top.label)}</b> ({top.value} response). BO teratas: <b>{rank0[0]?.bo}</b> ({rank0[0]?.total}).</li>}
      </ul></div>
    </Page>
  );
}
