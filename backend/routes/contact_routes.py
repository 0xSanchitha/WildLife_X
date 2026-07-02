import datetime
from flask import Blueprint, request, jsonify
from database.db import db
from utils.email_utils import send_email

contact_bp = Blueprint("contact", __name__)
messages_col = db["contact_messages"]


@contact_bp.route("/", methods=["POST"])
def submit_contact():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    subject = (data.get("subject") or "WildLifeX Contact").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are required."}), 400

    doc = {
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
        "created_at": datetime.datetime.utcnow(),
    }
    messages_col.insert_one(doc)

    html = f"""
    <h2>New WildLifeX Contact Message</h2>
    <p><strong>From:</strong> {name} &lt;{email}&gt;</p>
    <p><strong>Subject:</strong> {subject}</p>
    <hr/>
    <p>{message.replace(chr(10), '<br/>')}</p>
    """
    email_ok, email_msg = send_email(
        f"[WildLifeX Contact] {subject}",
        html,
        reply_to=email,
    )

    return jsonify({
        "message": "Message received. We will get back to you soon.",
        "email_sent": email_ok,
    }), 201
