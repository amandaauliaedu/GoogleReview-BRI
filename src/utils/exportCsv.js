export function exportCsv(filename, headers, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}
