import { EMPTY_FILTER } from "../utils/useMaster";
import { ROSTER, ROSTER_BOS } from "../utils/roster";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = Array.from({ length: 31 }, (_, i) => [String(i + 1), String(i + 1)]);
const MONTHS = BULAN.map((b, i) => [String(i + 1), b]);
const UKERS = ROSTER.map((u) => [u.key, `${u.kode}-${u.nama}`]);
export default function FilterBar({ all, filter, setFilter, reload, at, showReset = true }) {
  const set = (k) => (e) => setFilter({ ...filter, [k]: e.target.value });
  const years = [...new Set([2026, 2027, 2028, 2029, 2030, ...all.map((r) => r.year).filter(Boolean)])].sort().map((y) => [String(y), String(y)]);
  const Sel = ({ k, ph, list }) => (
    <select value={filter[k]} onChange={set(k)}><option value="">{ph}</option>
      {list.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>))}</select>);
  return (
    <div className="bar filters glass">
      <Sel k="day" ph="Semua Tanggal (1-31)" list={DAYS} />
      <Sel k="month" ph="Semua Bulan (Jan-Des)" list={MONTHS} />
      <Sel k="year" ph="Semua Tahun" list={years} />
      <Sel k="bo" ph="Semua Branch Office" list={ROSTER_BOS} />
      <Sel k="uker" ph="Semua Kode Uker-Nama Uker" list={UKERS} />
      <Sel k="jenis" ph="Semua Jenis Uker" list={["BO", "KK", "KCP", "Unit"]} />
      {showReset && <button className="ghost" onClick={() => setFilter(EMPTY_FILTER)}>Reset</button>}
      <button className="ghost" onClick={reload}>↻ Refresh</button>
      <span className="live"><i className="dot" />LIVE{at ? ` • ${at.toLocaleTimeString("id-ID")}` : ""}</span>
    </div>
  );
}
