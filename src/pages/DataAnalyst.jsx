import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { Page, KPICard, EmptyState } from "../components/ui";
import { rosterFilter } from "../utils/roster";
import { groupByBO, groupByUker, groupByDate, groupByMonth, groupByCount, uniqueCount, pct, fmtPct } from "../utils/calculations";

const COLORS = ["#3b8cff", "#f5a300", "#12c38b", "#ff5d63", "#8b7cff", "#22c8de"];
const Chart = ({ title, children, h = 260 }) => <div className="card"><b>{title}</b><div style={{ height: h, marginTop: 8 }}><ResponsiveContainer>{children}</ResponsiveContainer></div></div>;
const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />;

export default function DataAnalyst({ rows, filter }) {
  const d = useMemo(() => {
    const bos = groupByBO(rows, filter), ukers = groupByUker(rows);
    const total = bos.reduce((a, b) => a + b.total, 0), target = bos.reduce((a, b) => a + b.target, 0);
    return { bos, ukers, total, target, daily: groupByDate(rows), monthly: groupByMonth(rows), jenis: groupByCount(rows, (r) => r.jenis || "-"),
      topUker: groupByCount(rows, (r) => r.nama).slice(0, 10), ok: ukers.filter((u) => u.pct >= 100).length, nUker: rosterFilter(filter).length };
  }, [rows, filter]);
  if (!rows.length) return <Page title="Data Analyst" lead=""><EmptyState /></Page>;
  const by = (g) => uniqueCount(rows.filter((r) => r.group === g), (r) => r.ukerKey);
  const cum = d.daily.reduce((a, x, i) => [...a, { label: x.label, value: x.value, kum: (a[i - 1]?.kum || 0) + x.value }], []);
  const ach = d.bos.map((b) => ({ ...b, label: b.bo, pctR: Math.round(b.pct) }));
  const rank = [...d.bos].sort((a, b) => b.total - a.total);
  const top = d.daily.reduce((a, x) => (x.value > (a?.value ?? -1) ? x : a), null);
  const dates = d.daily.map((x) => x.label), hmUker = [...d.ukers].sort((a, b) => b.total - a.total).slice(0, 15);
  const gap = Math.max(d.target - d.total, 0);
  return (
    <Page title="Data Analyst" lead="Eksplorasi visual. Semua angka dihitung dari data aktual dan mengikuti filter di atas.">
      <div className="kpis">{[["Total Response", d.total], ["Total BO", d.bos.length], ["Total KK/KCP", by("KK/KCP")], ["Total Unit", by("Unit")],
        ["Average Response / Hari", d.daily.length ? (d.total / d.daily.length).toFixed(1) : 0], ["Total Target", d.target], ["Total Actual", d.total], ["Achievement", fmtPct(pct(d.total, d.target))]]
        .map(([l, v], i) => <KPICard key={l} label={l} value={v} i={i} />)}</div>
      <div className="card insight"><b>Insight otomatis</b><ul>
        <li>Total response periode terpilih: <b>{d.total.toLocaleString("id-ID")}</b> dari <b>{d.nUker}</b> uker.</li>
        <li>Uker mencapai target (≥5 input): <b>{d.ok}</b> • belum mencapai: <b>{d.nUker - d.ok}</b>.</li>
        <li>Achievement keseluruhan: <b>{fmtPct(pct(d.total, d.target))}</b> • gap ke target: <b>{gap}</b> input.</li>
        {top && <li>Hari tertinggi: <b>{top.label}</b> ({top.value} response). BO teratas: <b>{rank[0]?.bo}</b> ({rank[0]?.total}).</li>}
      </ul></div>
      <div className="grid2">
        <Chart title="1. Response per Tanggal"><BarChart data={d.daily}>{grid}<XAxis dataKey="label" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="value" name="Response" fill={COLORS[0]} radius={[4, 4, 0, 0]} /></BarChart></Chart>
        <Chart title="2. Response per Bulan"><BarChart data={d.monthly}>{grid}<XAxis dataKey="label" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="value" name="Response" fill={COLORS[1]} radius={[4, 4, 0, 0]} /></BarChart></Chart>
        <Chart title="3. Response per BO" h={320}><BarChart data={d.bos} layout="vertical" margin={{ left: 40 }}>{grid}<XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="bo" width={110} fontSize={11} /><Tooltip /><Bar dataKey="total" name="Response" fill={COLORS[0]} radius={[0, 4, 4, 0]} /></BarChart></Chart>
        <Chart title="4. Top 10 Uker" h={320}><BarChart data={d.topUker} layout="vertical" margin={{ left: 40 }}>{grid}<XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="label" width={120} fontSize={11} /><Tooltip /><Bar dataKey="value" name="Response" fill={COLORS[2]} radius={[0, 4, 4, 0]} /></BarChart></Chart>
        <Chart title="5. Target vs Actual per BO"><BarChart data={d.bos}>{grid}<XAxis dataKey="bo" fontSize={10} /><YAxis fontSize={11} /><Tooltip /><Legend /><Bar dataKey="target" name="Target" fill="#9db4d9" /><Bar dataKey="total" name="Actual" fill={COLORS[0]} /></BarChart></Chart>
        <Chart title="6. Achievement % per BO"><BarChart data={ach}>{grid}<XAxis dataKey="label" fontSize={10} /><YAxis unit="%" fontSize={11} /><Tooltip formatter={(v) => `${v}%`} /><Bar dataKey="pctR" name="Achievement" radius={[4, 4, 0, 0]}>{ach.map((a, i) => <Cell key={i} fill={a.pct >= 100 ? COLORS[2] : COLORS[0]} />)}</Bar></BarChart></Chart>
        <Chart title="7. Distribusi Jenis Uker"><PieChart><Pie data={d.jenis} dataKey="value" nameKey="label" outerRadius={90} label>{d.jenis.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></Chart>
        <Chart title="8. Trend Harian & Kumulatif"><AreaChart data={cum}>{grid}<XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend /><Area dataKey="kum" name="Kumulatif" fill={COLORS[0]} fillOpacity={0.15} stroke={COLORS[0]} /><Line dataKey="value" name="Harian" stroke={COLORS[1]} /></AreaChart></Chart>
      </div>
      <div className="grid2">
        <div className="card"><b>9. Ranking BO berdasarkan Total Input</b><ol className="rank">{rank.map((b) => <li key={b.bo}><span>{b.bo}</span><b>{b.total}</b><small>{fmtPct(b.pct)}</small></li>)}</ol></div>
        <div className="card"><b>10. Heatmap Tanggal × Uker (top 15)</b><div className="tw" style={{ maxHeight: 340, marginTop: 8 }}>
          {hmUker.map((u) => <div key={u.key} className="hmrow"><span title={u.key}>{u.nama}</span>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${dates.length},1fr)`, gap: 2, flex: 1 }}>
              {dates.map((dt) => { const n = u.daily[dt] || 0; return <i key={dt} title={`${u.nama} • ${dt}: ${n}`} style={{ opacity: n ? 0.2 + Math.min(n / 5, 0.8) : 0.06 }} />; })}</div></div>)}</div></div>
      </div>
    </Page>
  );
}
