import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AgentsDashboardOld() {
  const [prompt, setPrompt] = useState("");
  const [streams, setStreams] = useState(["", "", "", ""]);
  const [doneAgents, setDoneAgents] = useState([false, false, false, false]);

  const [coordinador, setCoordinador] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingCoordinator, setLoadingCoordinator] = useState(false);

  // 🔧 FORMATEO ROBUSTO DEL COORDINADOR
  let coordinadorText = "";

  if (Array.isArray(coordinador)) {
    coordinadorText = coordinador.join("");
  } else if (typeof coordinador === "string") {
    coordinadorText = coordinador;
  } else if (coordinador != null) {
    coordinadorText = JSON.stringify(coordinador, null, 2);
  }

  const runAgents = () => {
    setStreams(["", "", "", ""]);
    setDoneAgents([false, false, false, false]);
    setLoadingAgents(true);
    setLoadingCoordinator(false);
    setCoordinador("");

    for (let i = 1; i <= 4; i++) {
      const evtSource = new EventSource(
        `http://localhost:8000/agente/${i}?prompt=${encodeURIComponent(prompt)}`
      );

      evtSource.onmessage = (event) => {
        setStreams(prev => {
          const updated = [...prev];
          updated[i - 1] += event.data;
          return updated;
        });
      };

      evtSource.onerror = () => {
        evtSource.close();
        setDoneAgents(prev => {
          const updated = [...prev];
          updated[i - 1] = true;
          return updated;
        });
      };
    }
  };

  React.useEffect(() => {
    if (doneAgents.every(v => v)) {
      setLoadingAgents(false);
      setLoadingCoordinator(true);

      fetch("http://localhost:8000/coordinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ofensivo: streams[0],
          defensivo: streams[1],
          tactico: streams[2],
          mental: streams[3]
        })
      })
        .then(r => r.json())
        .then(data => {
          setCoordinador(data.coordinador);
          setLoadingCoordinator(false);
        })
        .catch(err => {
          setCoordinador({ error: err.toString() });
          setLoadingCoordinator(false);
        });
    }
  }, [doneAgents]);

  return (
    <div style={{ padding: 30 }}>
      <h1>Multi-Agente con Coordinador</h1>

      <div style={{ marginBottom: 10 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe un prompt..."
          style={{
            padding: 10,
            width: "60%",
            marginRight: 10
          }}
        />

        <button
          onClick={runAgents}
          disabled={loadingAgents || loadingCoordinator}
          style={{
            padding: 10,
            opacity: loadingAgents || loadingCoordinator ? 0.5 : 1
          }}
        >
          Ejecutar
        </button>
      </div>

      {loadingAgents && <p>⏳ Ejecutando agentes...</p>}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          marginTop: 20
        }}
      >
        {["Ofensivo", "Defensivo", "Táctico", "Mental"].map((label, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              padding: 20,
              borderRadius: 8,
              maxWidth: 650,
              minWidth: 400,
              height: 260,
              overflowY: "auto",
              background: "#fafafa",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)"
            }}
          >
            <h3>{label}</h3>

            {!doneAgents[idx] && (
              <p style={{ color: "#777", fontSize: 12 }}>
                ⏳ Esperando respuesta...
              </p>
            )}

            {/* RENDER MARKDOWN DEL AGENTE */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {streams[idx] || ""}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 30 }}>Coordinador</h2>

      {loadingCoordinator && (
        <p style={{ color: "blue" }}>⌛ Coordinador analizando las alineaciones...</p>
      )}

      <div
        style={{
          border: "2px solid #555",
          padding: 20,
          borderRadius: 8,
          maxWidth: 950,
          height: 350,
          overflowY: "auto",
          background: "#f0f0f0",
          marginTop: 15,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }}
      >
        {/* RENDER MARKDOWN DEL COORDINADOR */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {coordinadorText || "Esperando resultados..."}
        </ReactMarkdown>
      </div>
    </div>
  );
}
