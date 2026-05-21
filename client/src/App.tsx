import { useState } from "react";

export function App() {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchServer = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL);

      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

      const json = await res.json();
      setData(json.message);
    } catch (err) {
      setError("Falha ao buscar dados. " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={fetchServer} disabled={loading}>
        {loading ? "Carregando..." : "Buscar dados"}
      </button>

      <p>{data}</p>
      {error && <p>{error}</p>}
    </>
  );
}
