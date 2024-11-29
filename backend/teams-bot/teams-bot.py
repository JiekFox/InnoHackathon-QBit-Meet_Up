from fastapi import FastAPI, Request
from botbuilder.core import BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext
from botbuilder.schema import Activity
import os


# Настройки бота
APP_ID = os.getenv("APP_ID")
APP_PASSWORD = os.getenv("APP_PASSWORD")

adapter_settings = BotFrameworkAdapterSettings(APP_ID, APP_PASSWORD)
adapter = BotFrameworkAdapter(adapter_settings)

app = FastAPI()

@app.post("/api/messages")
async def messages(request: Request):
    body = await request.json()
    activity = Activity().deserialize(body)

    async def process_activity(turn_context: TurnContext):
        if activity.text == "hello":
            await turn_context.send_activity("Hi there! How can I assist you?")
        else:
            await turn_context.send_activity("I'm here to help!")

    await adapter.process_activity(activity, "", process_activity)
    return {"status": "ok"}
