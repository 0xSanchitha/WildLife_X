from flask import Flask
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.animal_routes import animal_bp
from routes.simulation_routes import simulation_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth_bp,        url_prefix="/api/auth")
app.register_blueprint(animal_bp,      url_prefix="/api/animals")
app.register_blueprint(simulation_bp,  url_prefix="/api/simulations")

@app.route("/")
def home():
    return {"message": "Backend running"}

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)