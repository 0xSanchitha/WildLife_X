import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import SMTP_EMAIL, SMTP_PASSWORD, CONTACT_RECIPIENT


def send_email(subject, html_body, reply_to=None):
    """
    Send email via Gmail SMTP.
    Returns (success: bool, message: str)
    """
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        return False, "Email not configured (set SMTP_EMAIL and SMTP_PASSWORD in .env)"

    recipient = CONTACT_RECIPIENT or SMTP_EMAIL

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = recipient
    if reply_to:
        msg["Reply-To"] = reply_to

    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, recipient, msg.as_string())
        return True, "Email sent"
    except Exception as exc:
        return False, str(exc)
