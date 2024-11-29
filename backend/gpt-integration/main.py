from fastapi import FastAPI, Request
import requests
import os

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST, OPTIONS и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set")


@app.post("/chatgpt")
async def chatgpt_endpoint(request: Request):
    try:
        body = await request.json()
        user_message = body.get("message", "")

        if not user_message:
            return {"error": "No message provided"}

        # Запрос к OpenAI API
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": user_message}],
                "max_tokens": 500,
            },
        )

        response_data = response.json()
        print("OpenAI API Response:", response_data)
        if response.status_code != 200:
            return {"error": response_data.get("error", {}).get("message", "Unknown error")}
        return response_data

    except Exception as e:
        print("Error:", e)
        return {"error": str(e)}
