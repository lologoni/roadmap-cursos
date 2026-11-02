"""Plantilla y envío del email de recuperación de contraseña por SMTP (TD-012)."""

import logging
import smtplib
from email.message import EmailMessage
from typing import Protocol

from app.config import obtener_settings

logger = logging.getLogger("rumbo.correo")


class EmisorCorreo(Protocol):
    def enviar_recuperacion(self, destinatario: str, nombre: str, enlace: str) -> None: ...


class EmisorSmtp:
    def enviar_recuperacion(self, destinatario: str, nombre: str, enlace: str) -> None:
        settings = obtener_settings()
        minutos = settings.recuperacion_expira_minutos
        mensaje = EmailMessage()
        mensaje["Subject"] = "Restablecé tu contraseña de Rumbo"
        mensaje["From"] = settings.smtp_remitente
        mensaje["To"] = destinatario
        mensaje.set_content(
            f"Hola, {nombre}:\n\n"
            "Recibimos un pedido para restablecer la contraseña de tu cuenta de Rumbo.\n"
            f"Abrí este enlace para elegir una nueva (vence en {minutos} minutos):\n\n"
            f"{enlace}\n\n"
            "Si no lo pediste, ignorá este email: tu contraseña no cambia.\n"
        )
        mensaje.add_alternative(
            f"""<!doctype html>
<html lang="es-AR"><body style="font-family: Roboto, Arial, sans-serif; color: #202124">
<p>Hola, {nombre}:</p>
<p>Recibimos un pedido para restablecer la contraseña de tu cuenta de Rumbo.</p>
<p><a href="{enlace}" style="display:inline-block;padding:10px 24px;border-radius:999px;
background:#1a73e8;color:#ffffff;text-decoration:none">Elegir una contraseña nueva</a></p>
<p>El enlace vence en {minutos} minutos. Si no lo pediste, ignorá este email.</p>
</body></html>""",
            subtype="html",
        )
        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as servidor:
                servidor.send_message(mensaje)
        except OSError:
            # La respuesta al usuario es siempre la misma; el fallo queda registrado
            logger.exception("no se pudo enviar el email de recuperación")
