import { EMPTY_FILTER } from "../utils/useMaster";
import { ROSTER, ROSTER_BOS } from "../utils/roster";

const uniq = (a) => [...new Set(a.filter(Boolean))].sort();
const UKERS = ROSTER.map((u) => [u.key, `${u.kode}-${u.nama}`]);
export default function FilterBar({ all, filter, setFilter, reload, at }) {
  const set = (k) => (e) => setFilter({ ...filter, [k]: e.target.value });
  const Sel = ({ k, ph, list }) => (
    <select value={filter[k]} onChange={set(k)}><option value="">{ph}</option>
      {list.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>))}</select>);
  return (
    <div className="bar filters glass">
      <Sel k="date" ph="Semua Tanggal" list={uniq(all.map((r) => r.date))} />
      <Sel k="month" ph="Semua Bulan" list={uniq(all.map((r) => r.month))} />
      <Sel k="bo" ph="Semua Branch Office" list={ROSTER_BOS} />
      <Sel k="uker" ph="Semua Kode Uker-Nama Uker" list={UKERS} />
      <Sel k="jenis" ph="Semua Jenis Uker" list={["BO", "KK", "KCP", "Unit"]} />
      <button className="ghost" onClick={() => setFilter(EMPTY_FILTER)}>Reset</button>
      <button className="ghost" onClick={reload}>↻ Refresh</button>
      <span className="live"><i className="dot" />LIVE{at ? ` • ${at.toLocaleTimeString("id-ID")}` : ""}</span>
    </div>
  );
}
