const ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "14X-lYyIm1ENiz7ZAzlKbTisWR1cPoWBeFrUZNupm6rc";
const TAB = import.meta.env.VITE_MASTER_TAB || "Data Master";
const VISIBLE_COLS = 9; // kolom 10-28 (J..AB) tidak ditampilkan/diproses

export function parseDate(c) {
  if (!c) return null;
  if (typeof c.v === "string" && c.v.startsWith("Date(")) {
    const [y, m, d] = c.v.match(/\d+/g).map(Number);
    return new Date(y, m, d);
  }
  const m = String(c.f ?? c.v ?? "").match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(c.f ?? c.v);
  return isNaN(d) ? null : d;
}
const p2 = (n) => String(n).padStart(2, "0");
const txt = (c) => (c ? String(c.f ?? c.v ?? "").trim() : "");

export async function fetchMaster() {
  const url = `https://docs.google.com/spreadsheets/d/${ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(TAB)}&_=${Date.now()}`;
  const t = await (await fetch(url)).text();
  const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
  if (j.status === "error") throw new Error(j.errors?.[0]?.detailed_message || "Sheet error");
  const labels = j.table.cols.slice(0, VISIBLE_COLS).map((c, i) => c.label || `Kolom ${i + 1}`);
  const idx = (re) => labels.findIndex((l) => re.test(l));
  const I = { tgl: idx(/tanggal|date/i), bc: idx(/branch code/i), bo: idx(/branch office/i), kode: idx(/kode uker/i),
    nama: idx(/nama uker/i), jenis: idx(/jenis/i), rate: idx(/rate/i) };
  const rows = [];
  for (const r of j.table.rows) {
    const c = (i) => (i >= 0 ? r.c?.[i] : null);
    const d = parseDate(c(I.tgl));
    const bo = txt(c(I.bo)), kode = txt(c(I.kode)), nama = txt(c(I.nama));
    if (!bo && !kode && !nama && !d) continue; // baris kosong
    rows.push({
      display: labels.map((_, i) => txt(r.c?.[i])),
      date: d ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` : "",
      month: d ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}` : "",
      bc: txt(c(I.bc)), bo: bo || "(Tanpa BO)", kode: kode || "-", nama: nama || "(Tanpa Uker)",
      jenis: txt(c(I.jenis)), rate: Number(txt(c(I.rate))) || 0,
      boKey: `${txt(c(I.bc))}-${bo}`, ukerKey: `${kode}-${nama}`,
    });
  }
  return { labels, rows, at: new Date() };
}
