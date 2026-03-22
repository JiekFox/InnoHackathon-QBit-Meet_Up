import logging
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from PIL import Image

_logger = logging.getLogger(__name__)


def send_email(subject, to_email, template_name, context):
    """
    Отправляет email с использованием HTML-шаблона.
    """
    message = render_to_string(template_name, context)
    email = EmailMessage(subject, message, to=[to_email])
    email.content_subtype = "html"
    email.send()


def convert_to_webp(image_field):
    img = Image.open(image_field)
    # Конвертируем в RGB (на случай RGBA, т.к. WebP не поддерживает прозрачность в простом режиме)
    img = img.convert("RGB")
    output = BytesIO()
    # Качество 85 — хороший баланс между размером и качеством
    img.save(output, format="WEBP", quality=85)
    output.seek(0)
    # Генерируем имя с расширением .webp
    original_name = image_field.name
    new_name = original_name.rsplit(".", 1)[0] + ".webp"
    return ContentFile(output.read(), name=new_name)


def check_file_exists(file_field, field_name="file", obj_repr="object"):
    if file_field and file_field.name:
        try:
            if not default_storage.exists(file_field.name):
                _logger.warning(
                    f"File {file_field.name} doesn't found in storage. " f"Clearing {field_name} for {obj_repr}"
                )
                return None
        except Exception as e:
            _logger.error(f"Error when reading file {file_field.name}: {e}")
    return file_field
