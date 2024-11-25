from django.core.mail import EmailMessage
from django.template.loader import render_to_string

def send_email(subject, to_email, template_name, context):
    """
    Отправляет email с использованием HTML-шаблона.
    """
    message = render_to_string(template_name, context)
    email = EmailMessage(subject, message, to=[to_email])
    email.content_subtype = 'html'
    email.send()
