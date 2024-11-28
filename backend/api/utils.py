from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from .models import UserProfile


def send_email(subject, to_email, template_name, context):
    """
    Отправляет email с использованием HTML-шаблона.
    """
    message = render_to_string(template_name, context)
    email = EmailMessage(subject, message, to=[to_email])
    email.content_subtype = "html"
    email.send()


def get_user_by_param(request, param):
        param_value = request.query_params.get(param, None)

        if not param_value:
            return None, f"{param} is required"

        try:
            if param == "tg_id":
                return UserProfile.objects.get(tg_id=param_value), None
            elif param == "teams_id":
                return UserProfile.objects.get(teams_id=param_value), None
            else:
                return None, f"Invalid parameter {param}"
        except UserProfile.DoesNotExist:
            return None, "User not found"
