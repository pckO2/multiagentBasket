import requests
import json

class OllamaWrapper:

    def __init__(self, model="qwen2.5:14b"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"

    def generate(self, prompt):
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": 0.0
            }
        }

        response = requests.post(self.url, json=payload, stream=True)

        if response.status_code != 200:
            raise Exception(f"Ollama error {response.status_code}: {response.text}")

        # Ollama envía línea por línea cada JSON
        for line in response.iter_lines():
            if not line:
                continue
            try:
                data = json.loads(line.decode("utf-8"))
                token = data.get("response", "")
                if token:
                    yield token
            except:
                continue