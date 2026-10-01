import { useMemo, useState } from "react";
import { Page, KPICard, DataTable, EmptyState } from "../components/ui";
import { uniqueCount } from "../utils/calculations";

export default function MasterData({ rows, labels }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => rows.filter((r) => !q || r.display.join(" ").toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const by = (g) => uniqueCount(list.filter((r) => r.group === g), (r) => r.ukerKey);
  const columns = labels.map((l, i) => ({ key: String(i), label: l, render: (r) => r.display[i], sortValue: (r) => (isNaN(r.display[i]) || r.display[i] === "" ? r.display[i] : Number(r.display[i])) }));
  const data = list.map((r) => ({ ...r, ...Object.fromEntries(r.display.map((v, i) => [String(i), v])) }));
  return (
    <Page title="Master Data" lead="Data response Google Review langsung dari Google Sheets (kolom 10–28 disembunyikan).">
      <div className="kpis">{[["Total Response", list.length], ["Total Uker", uniqueCount(list, (r) => r.ukerKey)], ["Total BO", uniqueCount(list, (r) => r.bo)], ["Total KK/KCP", by("KK/KCP")], ["Total Unit", by("Unit")]]
        .map(([l, v], i) => <KPICard key={l} label={l} value={v} i={i} />)}</div>
      <div className="bar"><input placeholder="Cari BO, kode uker, nama uker…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {list.length === 0 ? <EmptyState /> : <div className="card"><DataTable columns={columns} rows={data} /></div>}
    </Page>
  );
}
