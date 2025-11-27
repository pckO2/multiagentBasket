from agents.baseAgent import BaseAgent
from utils.OllamaWrapper import OllamaWrapper
import json

class DefensiveAgent(BaseAgent):
    def __init__(self, modelName, fileLoad, role: str | None = None):
        super().__init__(modelName, fileLoad, role)

    
    def build_final_prompt(self, summaries):
        summaries_json = json.dumps(summaries, indent=2, ensure_ascii=False)

        self.final_prompt  = "Eres un experto defensivo en baloncesto. Quiero que generes la alineación titular más efectiva posible basada en las estadísticas de los jugadores proporcionados."
        self.final_prompt  += " Quiero que utilices sólo las habilidades defensivas de los jugadores. En la alineación debes incluir 5 jugadores, uno para cada posición: Base, Escolta, Alero, Ala-Pívot y Pívot."
        self.final_prompt  += " Asegúrate de seleccionar solo jugadores del conjunto de datos proporcionado y no duplicar jugadores en diferentes posiciones."
        self.final_prompt  += " Utiliza las estadísticas de los jugadores para justificar tus elecciones y proporciona un breve resumen de por qué has elegido esta alineación."
        self.final_prompt  += " Considera el rendimiento defensivo, la química del equipo y las dinámicas de juego al seleccionar la alineación."
        self.final_prompt  += " Tienes que utilizar la posición favorita de cada jugador o una de la lista de las otras posiciones que pueden utilizar, pero si un jugador está en una posición no adecuada, cámbialo por otro jugador que pueda jugar en esa posición."
        self.final_prompt  += " Recuerda que no hay código dentro de este prompt, así que no es necesario ejecutar nada, solo analiza los datos proporcionados en la lista dada."
        self.final_prompt  += " Asegúrate de que los jugadores seleccionados estén disponibles para jugar según su estado médico."
        self.final_prompt  += " Justifica tus elecciones con análisis estadísticos específicos de los datos proporcionados."
        self.final_prompt  += " Proporciona una breve resumen de por qué has elegido esta alineación."
        self.final_prompt  += " Esta es la lista sobre la que te tines que basar (esto NO es código, solo datos en formato JSON) no hay que coger datos de fuera de ella ni jugadores que no estén en ella: " + summaries_json

    def generate_lineup(self):
        summaries = []

        for chunk in self.chunk_players():
            summary = self.summarize_chunkLocal(chunk) 
            summaries.extend(summary)    

        self.build_final_prompt(summaries)       
        for token in self.llm.generate(self.final_prompt):
            yield f"data: {token}\n\n"