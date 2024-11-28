from fastapi import FastAPI, Request
import requests
import os

app = FastAPI()

# Получаем API ключ OpenAI из переменных окружения
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

@app.post("/chatgpt")
async def chatgpt_endpoint(request: Request):
    body = await request.json()
    user_message = body.get("message", "")

    if not user_message:
        return {"error": "No message provided"}

    # Запрос к ChatGPT API
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": user_message}],
            "max_tokens": 500
        }
    )

    if response.status_code != 200:
        return {"error": "Failed to communicate with OpenAI API"}

    return response.json()
