import pika
import json
from django.conf import settings

def get_connection():
    """
    Устанавливает соединение с RabbitMQ.
    """
    url = settings.RABBITMQ_URL
    params = pika.URLParameters(url)
    return pika.BlockingConnection(params)

def publish_message(queue, message):
    """
    Публикует сообщение в RabbitMQ.
    """
    connection = get_connection()
    channel = connection.channel()

    channel.queue_declare(queue=queue, durable=True)

    channel.basic_publish(
        exchange="",
        routing_key=queue,
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,
        )
    )
    connection.close()

def process_message(queue, callback):
    """
    Забирает и обрабатывает сообщение из очереди RabbitMQ.
    """
    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue=queue, durable=True)

    method_frame, _, body = channel.basic_get(queue=queue, auto_ack=False)

    if method_frame:
        try:
            callback(json.loads(body))
            channel.basic_ack(delivery_tag=method_frame.delivery_tag)
        except Exception as e:
            print(f"Ошибка обработки сообщения: {e}")

    connection.close()