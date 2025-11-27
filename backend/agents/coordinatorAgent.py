from utils.OllamaWrapper import OllamaWrapper
import json

COORD_PROMPT = """
Eres un COORDINADOR experto en baloncesto.

Recibes el análisis de 4 agentes especialistas:
1. Ofensivo
2. Defensivo
3. Táctico
4. Psicológico

Debes sintetizar TODAS sus conclusiones en:
- Alineación final más equilibrada
- Justificación con criterios de los 4 agentes
- Fortalezas y debilidades
- Cómo combinarían sus recomendaciones

NO ignores ningún agente.
NO inventes datos que no aparezcan en los textos.

ANÁLISIS RECIBIDO:
{respuestas}

Genera una respuesta final clara y experta.
"""

class CoordinatorAgent:

    def __init__(self, modelName="qwen2.5:14b"):
        self.llm = OllamaWrapper(modelName)

    def generate_summary(self, respuestas):
        text = json.dumps(respuestas, indent=2, ensure_ascii=False)
        prompt = COORD_PROMPT.format(respuestas=text)

        return self.llm.generate(prompt)
