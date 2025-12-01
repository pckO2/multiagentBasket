from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from agents.coordinatorAgent import CoordinatorAgent
from agents.offensiveAgent import OffensiveAgent
from agents.defensiveAgent import DefensiveAgent
from agents.tacticAgent import TacticAgent
from agents.pychologicalAgent import PsychologicalAgent
from fastapi.middleware.cors import CORSMiddleware


# 4 base agents
agent_offense = OffensiveAgent(fileLoad="./data/players.json", modelName="qwen2.5:14b", role="ofensivo")
agent_defense = DefensiveAgent(fileLoad="./data/players.json", modelName="qwen2.5:14b", role="defensivo")
agent_tactic  = TacticAgent(fileLoad="./data/players.json", modelName="qwen2.5:14b", role="tactico")
agent_mental  = PsychologicalAgent(fileLoad="./data/players.json", modelName="qwen2.5:14b", role="mental")

# Coordinator
agent_coord   = CoordinatorAgent(modelName="qwen2.5:14b")

agents = [agent_offense, agent_defense, agent_tactic, agent_mental]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def stream_response(agent, prompt):
    yield from agent.generate_lineup()


@app.get("/agente/{id}")
def stream_agent(id: int, prompt: str=""):
    agent = agents[id - 1]
    return StreamingResponse(stream_response(agent, prompt), media_type="text/event-stream")


@app.post("/coordinar")
async def coordinar(respuestas: dict):
    """
    Recibe las 4 respuestas generadas por los agentes y las resume en un análisis final.
    """
    resumen = agent_coord.generate_summary(respuestas)
    return {"coordinador": resumen}