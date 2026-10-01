import RAW from "../data/ukerList.js";

export const groupOf = (j = "") => (/\b(kk|kcp)\b/i.test(j) ? "KK/KCP" : /unit/i.test(j) ? "Unit" : "BO");
const typeOf = (n) => (/^KCP\b/i.test(n) ? "KCP" : /^KK\b/i.test(n) ? "KK" : /^Unit\b/i.test(n) ? "Unit" : "BO");
const mk = (boCode, bo, kode, nama) => { const jenis = typeOf(nama); return { boCode, bo, kode, nama, jenis, group: groupOf(jenis), key: `${kode}|${nama.toLowerCase()}` }; };

export const ROSTER = RAW.split("\n").map((l) => l.trim()).filter(Boolean).flatMap((line) => {
  const [code, bo, rest] = line.split("|");
  return [mk(code, bo, code, bo), ...rest.split(";").map((s) => { const i = s.indexOf(" "); return mk(code, bo, s.slice(0, i), s.slice(i + 1)); })];
});
export const ROSTER_BOS = [...new Set(ROSTER.map((u) => u.bo))];
const byKey = new Map(ROSTER.map((u) => [u.key, u]));
const byKode = new Map(); ROSTER.forEach((u) => !byKode.has(u.kode) && byKode.set(u.kode, u));

export const rosterFilter = (f = {}) => ROSTER.filter((u) => (!f.bo || u.bo === f.bo) && (!f.uker || u.key === f.uker) && (!f.jenis || u.jenis === f.jenis));

export function enrich(rows) {
  return rows.map((r) => {
    const u = byKey.get(`${r.kode}|${r.nama.toLowerCase()}`) || byKode.get(r.kode);
    if (!u) return { ...r, group: groupOf(r.jenis), ukerKey: `${r.kode}|${r.nama.toLowerCase()}` };
    return { ...r, bo: u.bo, bc: u.boCode, kode: u.kode, nama: u.nama, jenis: u.jenis, group: u.group, ukerKey: u.key };
  });
}
