from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Gmail SMTP — use an App Password for wildlifex74@gmail.com
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "wildlifex74@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
CONTACT_RECIPIENT = os.getenv("CONTACT_RECIPIENT", "wildlifex74@gmail.com")