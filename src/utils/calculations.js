export const TARGET = 5; // 5 input = 100%
export const pct = (actual, target) => (target > 0 ? (actual / target) * 100 : 0);
export const fmtPct = (n) => `${(Math.round(n * 10) / 10).toLocaleString("id-ID")}%`;
import { rosterFilter } from "./roster";
export { groupOf as jenisGroup } from "./roster";

export const calculateBOTarget = () => TARGET;
export const calculateKKKCPTarget = (jumlahUker) => TARGET * jumlahUker;
export const calculateUnitTarget = (jumlahUker) => TARGET * jumlahUker;
export const calculateBOAchievement = (input) => pct(input, calculateBOTarget());
export const calculateKKKCPAchievement = (input, n) => pct(input, calculateKKKCPTarget(n));
export const calculateUnitAchievement = (input, n) => pct(input, calculateUnitTarget(n));

const count = (rows, key) => rows.reduce((a, r) => ((a[key(r)] = (a[key(r)] || 0) + 1), a), {});
export const uniqueCount = (rows, key) => new Set(rows.map(key)).size;

export function groupByBO(rows, filter = {}) {
  const m = {};
  const get = (bo, bc) => (m[bo] ||= { bo, bc, boN: 0, nKK: 0, nUnit: 0, boInput: 0, kkInput: 0, unitInput: 0 });
  for (const u of rosterFilter(filter)) { const b = get(u.bo, u.boCode); if (u.group === "BO") b.boN++; else if (u.group === "KK/KCP") b.nKK++; else b.nUnit++; }
  for (const r of rows) {
    if (filter.bo && r.bo !== filter.bo) continue;
    const b = get(r.bo, r.bc);
    if (r.group === "BO") b.boInput++; else if (r.group === "KK/KCP") b.kkInput++; else b.unitInput++;
  }
  return Object.values(m).map((b) => {
    const boTarget = calculateBOTarget() * b.boN, kkTarget = calculateKKKCPTarget(b.nKK), unitTarget = calculateUnitTarget(b.nUnit);
    const total = b.boInput + b.kkInput + b.unitInput, target = boTarget + kkTarget + unitTarget;
    return { bo: b.bo, bc: b.bc, nKK: b.nKK, nUnit: b.nUnit, boInput: b.boInput, boPct: pct(b.boInput, boTarget),
      kkInput: b.kkInput, kkTarget, kkPct: calculateKKKCPAchievement(b.kkInput, b.nKK),
      unitInput: b.unitInput, unitTarget, unitPct: calculateUnitAchievement(b.unitInput, b.nUnit), total, target, pct: pct(total, target) };
  });
}
export function groupByUker(rows) {
  const m = {};
  for (const r of rows) {
    const u = (m[r.ukerKey] ||= { key: r.ukerKey, bo: r.bo, kode: r.kode, nama: r.nama, jenis: r.jenis || "-", total: 0, daily: {}, monthly: {} });
    u.total++; u.daily[r.date] = (u.daily[r.date] || 0) + 1; u.monthly[r.month] = (u.monthly[r.month] || 0) + 1;
  }
  return Object.values(m).map((u) => ({ ...u, target: TARGET, pct: pct(u.total, TARGET) }));
}
export const groupByDate = (rows) => Object.entries(count(rows.filter((r) => r.date), (r) => r.date)).sort().map(([label, value]) => ({ label, value }));
export const groupByMonth = (rows) => Object.entries(count(rows.filter((r) => r.month), (r) => r.month)).sort().map(([label, value]) => ({ label, value }));
export const groupByCount = (rows, key) => Object.entries(count(rows, key)).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
