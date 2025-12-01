from smolagents import CodeAgent
from utils.OllamaWrapper import OllamaWrapper
import json

class BaseAgent:
    def __init__(self, modelName, fileLoad, role: str | None = None):
        self.modelName = modelName
        self.fileLoad = fileLoad
        self.role = role
        self.llm = OllamaWrapper(modelName)
        # load players
        data = json.load(open(self.fileLoad))
        self.players = data["players"]

    def create_agent(self):
        llm = OllamaWrapper(model= self.modelName)

        agent = CodeAgent(
            model= llm,
            tools=[],
            max_steps=1,
            additional_authorized_imports= ["pandas", "numpy", "json"],
        )
        return agent

    def chunk_players(self, chunk_size=5):
        """
        Generator that yields chunks of players.
        """
        for i in range(0, len(self.players), chunk_size):
            yield self.players[i:i + chunk_size]

    def summarize_chunkLocal(self, chunk):
        summaries = []

        for p in chunk:
            summary = {
                "name": p.get("name"),
                "preferred_position": p.get("preferred_position"),
                "other_positions": p.get("other_positions", []),
                "ppg": p.get("stats_season", {}).get("points_per_game"),
                "apg": p.get("stats_season", {}).get("assists_per_game"),
                "rpg": p.get("stats_season", {}).get("rebounds_per_game"),
                "fg_pct": p.get("stats_season", {}).get("field_goal_percentage"),
                "3pt_pct": p.get("stats_season", {}).get("three_point_percentage"),
                "ft_pct": p.get("stats_season", {}).get("free_throw_percentage"),
                "tov_per_game": p.get("stats_season", {}).get("turnovers_per_game"),
                "pf_per_game": p.get("stats_season", {}).get("personal_fouls_per_game"),
                "stpg":  p.get("stats_season", {}).get("steals_per_game"),
                "bpg": p.get("stats_season", {}).get("blocks_per_game"),
                "minutes_per_game": p.get("stats_season", {}).get("minutes_per_game"),
                "off_rating": p.get("stats_season", {}).get("offensive_rating"),
                "def_rating": p.get("stats_season", {}).get("defensive_rating"),
                "available": p.get("medical_status", {}).get("available"),
            }
            summaries.append(summary)

        return summaries