import { useMemo } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { ArrowUpRight, ClipboardList, Building2, Gauge, ShieldCheck, Download, Target } from "lucide-react";
import { KPICard, ProgressBar } from "../components/ui";
import { groupByBO, groupByUker, groupByDate, pct } from "../utils/calculations";
import { ROSTER, ROSTER_BOS } from "../utils/roster";

const KEYS = new Set(ROSTER.map((u) => u.key));
export default function Home({ rows, go, onDownload }) {
  const d = useMemo(() => {
    const bos = groupByBO(rows), total = rows.length, target = bos.reduce((a, b) => a + b.target, 0);
    const ok = groupByUker(rows).filter((u) => u.total >= 5 && KEYS.has(u.key)).length;
    return { bos, total, target, ok, active: bos.filter((b) => b.total > 0).length, daily: groupByDate(rows).slice(-14) };
  }, [rows]);
  const rank = [...d.bos].sort((a, b) => b.pct - a.pct);
  const sz = 18;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="hero">
        <div className="hero-txt">
          <motion.div className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>◎ OPERATION, SERVICE, AND E-CHANNEL (OSE)</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>BRI REGION 12 <span className="hl">SURABAYA</span></motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            Pantau response, analisis performa, dan unduh laporan pengisian Google Review seluruh BO &amp; unit kerja — dalam satu ruang kendali.</motion.p>
          <motion.div className="cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <button className="btn primary" onClick={() => go("master")}>Lihat Live Response <ArrowUpRight size={15} /></button>
            <button className="btn" onClick={onDownload}><Download size={15} /> Unduh Report Final</button>
            <button className="btn" onClick={() => go("analyst")}>Buka Data Analyst</button>
          </motion.div>
        </div>
        <div className="orbit" aria-hidden>
          <div className="ring r1" /><div className="ring r2" />
          <motion.div className="spin" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 24, ease: "linear" }}><i className="orb" /></motion.div>
        </div>
      </section>

      <section>
        <div className="eyebrow sm">RINGKASAN CEPAT</div>
        <h2>Status Google Review Terkini</h2>
        <div className="kpis4">
          <KPICard i={0} label="TOTAL RESPONSE" value={d.total.toLocaleString("id-ID")} icon={<ClipboardList size={sz} />} />
          <KPICard i={1} label="BO AKTIF (SUDAH MENGISI)" value={d.active} unit={` / ${ROSTER_BOS.length}`} icon={<Building2 size={sz} />} />
          <KPICard i={2} label="ACHIEVEMENT RATA-RATA" value={Math.round(pct(d.total, d.target) * 10) / 10} unit="%" icon={<Gauge size={sz} />} />
          <KPICard i={3} label="UKER MENCAPAI TARGET" value={Math.round((d.ok / ROSTER.length) * 1000) / 10} unit="%" icon={<ShieldCheck size={sz} />} />
        </div>
        <div className="grid3">
          <div className="card glass"><b><Target size={14} /> Top 5 BO</b>
            <ol className="rank">{rank.slice(0, 5).map((b) => <li key={b.bo}><span>{b.bo}</span><ProgressBar value={b.pct} /></li>)}</ol></div>
          <div className="card glass"><b>Tren 14 Hari Terakhir</b>
            <div style={{ height: 150, marginTop: 8 }}><ResponsiveContainer><AreaChart data={d.daily}>
              <XAxis dataKey="label" hide /><Tooltip />
              <Area dataKey="value" name="Response" stroke="#3b8cff" fill="#3b8cff" fillOpacity={0.25} strokeWidth={2} /></AreaChart></ResponsiveContainer></div></div>
          <div className="card glass"><b>Perlu Perhatian (terendah)</b>
            <ol className="rank">{[...rank].reverse().slice(0, 5).map((b) => <li key={b.bo}><span>{b.bo}</span><ProgressBar value={b.pct} /></li>)}</ol></div>
        </div>
      </section>
    </motion.div>
  );
}
