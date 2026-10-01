import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMaster } from "../services/googleSheetApi";
import { enrich } from "./roster";

const POLL_MS = 30000;
export const EMPTY_FILTER = { day: "", month: "", year: "", bo: "", uker: "", jenis: "" };

export function useMaster() {
  const [state, setState] = useState({ loading: true, rows: [], labels: [] });
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const load = useCallback(async () => {
    try { const d = await fetchMaster(); setState({ ...d, rows: enrich(d.rows), loading: false }); }
    catch (e) { console.error(e); setState((s) => ({ ...s, loading: false, error: true })); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, POLL_MS); return () => clearInterval(t); }, [load]);

  const rows = useMemo(() => state.rows.filter((r) =>
    (!filter.day || r.day === +filter.day) && (!filter.month || r.mon === +filter.month) && (!filter.year || r.year === +filter.year) &&
    (!filter.bo || r.bo === filter.bo) && (!filter.uker || r.ukerKey === filter.uker) &&
    (!filter.jenis || r.jenis === filter.jenis)), [state.rows, filter]);
  return { ...state, all: state.rows, rows, filter, setFilter, reload: load };
}
