import { useCallback, useEffect, useState } from "react";
export function useApi(fetcher, options = {}) {
  const { immediate = true } = options;
  const [data, setData] = useState(null); const [loading, setLoading] = useState(immediate); const [error, setError] = useState("");
  const execute = useCallback(async (...args) => { setLoading(true); setError(""); try { const result = await fetcher(...args); setData(result); return result; } catch (err) { setError(err.message || "Request failed"); throw err; } finally { setLoading(false); } }, [fetcher]);
  useEffect(() => { if (immediate) execute().catch(() => {}); }, [execute, immediate]);
  return { data, loading, error, execute, setData };
}
