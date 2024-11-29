from flask import Flask, request
from botbuilder.core import BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext
from botbuilder.schema import Activity
import os

app = Flask(__name__)

# Настройки бота
APP_ID = os.getenv("APP_ID")
APP_PASSWORD = os.getenv("APP_PASSWORD")

adapter_settings = BotFrameworkAdapterSettings(APP_ID, APP_PASSWORD)
adapter = BotFrameworkAdapter(adapter_settings)

@app.route("/api/messages", methods=["POST"])
def messages():
    body = request.json
    activity = Activity().deserialize(body)

    async def process_activity(turn_context: TurnContext):
        if activity.text.lower() == "hello":
            await turn_context.send_activity("Hi there! How can I assist you?")
        else:
            await turn_context.send_activity("I'm here to help!")

    adapter.process_activity(activity, "", process_activity)
    return "", 200

if __name__ == "__main__":
    app.run(port=8000)
