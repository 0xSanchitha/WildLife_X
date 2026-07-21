from flask import Flask
from flask_cors import CORS
import os

from routes.auth_routes import auth_bp
from routes.animal_routes import animal_bp
from routes.simulation_routes import simulation_bp
from routes.stats_routes import stats_bp
from routes.contact_routes import contact_bp
from routes.review_routes import review_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth_bp,        url_prefix="/api/auth")
app.register_blueprint(animal_bp,      url_prefix="/api/animals")
app.register_blueprint(simulation_bp,  url_prefix="/api/simulations")
app.register_blueprint(stats_bp,       url_prefix="/api/stats")
app.register_blueprint(contact_bp,     url_prefix="/api/contact")
app.register_blueprint(review_bp,      url_prefix="/api/reviews")

@app.route("/")
def home():
    return {"message": "Backend running"}

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )