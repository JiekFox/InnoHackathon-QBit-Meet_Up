from fastapi import FastAPI, Request, Header, HTTPException
from botbuilder.core import BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext
from botbuilder.schema import Activity
from botframework.connector.auth import JwtTokenValidation, MicrosoftAppCredentials

# Настройка приложения
APP_ID = "your-app-id"  # Ваш Application ID из Azure
APP_PASSWORD = "your-app-password"  # Ваш Client Secret из Azure

adapter_settings = BotFrameworkAdapterSettings(APP_ID, APP_PASSWORD)
adapter = BotFrameworkAdapter(adapter_settings)

app = FastAPI()


@app.post("/api/messages")
async def messages(request: Request, authorization: str = Header(None)):
    # Логируем Authorization Header
    print(f"Authorization Header: {authorization}")

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token is missing")

    # Проверка токена
    credentials = MicrosoftAppCredentials(APP_ID, APP_PASSWORD)
    try:
        claims_identity = await JwtTokenValidation.authenticate_request(
            request, credentials, adapter.settings.channel_service
        )
        if not claims_identity.is_authenticated:
            raise HTTPException(status_code=401, detail="Authorization token is invalid")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    # Обработка сообщения
    body = await request.json()
    activity = Activity().deserialize(body)

    async def process_activity(turn_context: TurnContext):
        if activity.text.lower() == "hello":
            await turn_context.send_activity("Hi there!")
        else:
            await turn_context.send_activity("I am here to assist.")

    await adapter.process_activity(activity, claims_identity.auth_header, process_activity)
    return {"status": "ok"}

