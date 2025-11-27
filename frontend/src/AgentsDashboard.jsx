import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AgentsDashboard() {
  const [prompt, setPrompt] = useState("");
  const [streams, setStreams] = useState(["", "", "", ""]);
  const [doneAgents, setDoneAgents] = useState([false, false, false, false]);

  const [coordinador, setCoordinador] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingCoordinator, setLoadingCoordinator] = useState(false);

  // ---- FORMATEO DEL COORDINADOR ----
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
        setDoneAgents(prev => {
          const updated = [...prev];
          updated[i - 1] = true;
          return updated;
        });
      };
    }
  };

  // ---- CUANDO LOS 4 AGENTES TERMINAN, SE LLAMA AL COORDINADOR ----
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

  // ---- ESTILOS NBA ----
  const roleStyles = [
    { label: "Ofensivo", color: "#D7263D", icon: "🔥" },
    { label: "Defensivo", color: "#1B6CA8", icon: "🛡️" },
    { label: "Táctico", color: "#1AA06F", icon: "⚡" },
    { label: "Mental", color: "#7B3FA0", icon: "🧠" }
  ];

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 10 }}>🏀 Multi-Agente VBC Dashboard</h1>

      <div style={{ marginBottom: 15 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe un prompt..."
          style={{
            padding: 12,
            width: "60%",
            marginRight: 10,
            borderRadius: 6,
            border: "1px solid #bbb"
          }}
        />

        <button
          onClick={runAgents}
          disabled={loadingAgents || loadingCoordinator}
          style={{
            padding: "10px 18px",
            background: "#FF8C00",
            border: "none",
            color: "white",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            opacity: loadingAgents || loadingCoordinator ? 0.6 : 1
          }}
        >
          Ejecutar
        </button>
      </div>

      {loadingAgents && <p>⏳ Ejecutando agentes...</p>}

      {/* ---- TARJETAS DE AGENTES ---- */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          marginTop: 20
        }}
      >
        {roleStyles.map((role, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: 12,
              maxWidth: 500,
              minWidth: 350,
              height: 280,
              background: "white",
              overflowY: "auto",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
              borderLeft: `12px solid ${role.color}`,
              padding: 20
            }}
          >
            <h3 style={{ margin: 0, color: role.color, fontSize: 22 }}>
              {role.icon} {role.label}
            </h3>

            {!doneAgents[idx] && (
              <p style={{ color: "#777", fontSize: 12 }}>
                ⏳ Esperando respuesta...
              </p>
            )}

            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {streams[idx]}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {/* ---- COORDINADOR ---- */}
      <h2 style={{ marginTop: 40, fontSize: 28 }}>🟧 Coordinador</h2>

      {loadingCoordinator && (
        <p style={{ color: "#FF8C00" }}>⌛ Analizando alineaciones...</p>
      )}

      <div
        style={{
          borderRadius: 12,
          maxWidth: 1000,
          height: 380,
          overflowY: "auto",
          background: "#FFF7E6",
          padding: 20,
          borderLeft: "14px solid #FF8C00",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.20)"
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {coordinadorText || "Esperando resultados..."}
        </ReactMarkdown>
      </div>
    </div>
  );
}
