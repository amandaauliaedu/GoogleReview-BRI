import { useMemo } from "react";
import { Page, DataTable, EmptyState, ProgressBar, KPICard } from "../components/ui";
import { groupByBO, pct, fmtPct } from "../utils/calculations";
import { exportCsv } from "../utils/exportCsv";

export default function ReportPerBO({ rows, filter }) {
  const bos = useMemo(() => groupByBO(rows, filter), [rows, filter]);
  if (!bos.length) return <Page title="Report Pengisian Google Review per BO" lead=""><EmptyState /></Page>;
  const sum = (k) => bos.reduce((a, b) => a + b[k], 0);
  const P = (r, k) => <ProgressBar value={r[k]} />;
  const columns = [
    { key: "bo", label: "Branch Office" }, { key: "nKK", label: "Jumlah KK/KCP" }, { key: "nUnit", label: "Jumlah Unit" },
    { key: "total", label: "Total Input" }, { key: "target", label: "Target" }, { key: "pct", label: "Persentase", render: (r) => P(r, "pct") },
    { key: "boInput", label: "BO Input" }, { key: "boPct", label: "% BO (T=5)", render: (r) => P(r, "boPct") },
    { key: "kkInput", label: "KK/KCP Input" }, { key: "kkTarget", label: "T KK/KCP" }, { key: "kkPct", label: "% KK/KCP", render: (r) => P(r, "kkPct") },
    { key: "unitInput", label: "Unit Input" }, { key: "unitTarget", label: "T Unit" }, { key: "unitPct", label: "% Unit", render: (r) => P(r, "unitPct") },
  ];
  return (
    <Page title="Report Pengisian Google Review per BO" lead="Agregasi per Branch Office → KK/KCP dan Unit. Target BO = 5; KK/KCP & Unit = 5 × jumlah uker.">
      <div className="kpis">{[["Jumlah BO", bos.length], ["Total Input", sum("total")], ["Total Target", sum("target")], ["Pencapaian", fmtPct(pct(sum("total"), sum("target")))]]
        .map(([l, v], i) => <KPICard key={l} label={l} value={v} i={i} />)}</div>
      <div className="bar"><button className="ghost" onClick={() => exportCsv("report-per-bo.csv", columns.map((c) => c.label), bos.map((r) => columns.map((c) => (typeof r[c.key] === "number" && c.key.toLowerCase().includes("pct") ? r[c.key].toFixed(1) : r[c.key]))))}>⬇ Unduh CSV</button></div>
      <div className="card glass"><DataTable columns={columns} rows={bos} rowKey={(r) => r.bo} /></div>
    </Page>
  );
}
