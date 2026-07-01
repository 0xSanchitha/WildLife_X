from flask import Blueprint
from controllers.auth_controller import register, login, me

auth_bp = Blueprint("auth", __name__)

auth_bp.route("/register", methods=["POST"])(register)
auth_bp.route("/login",    methods=["POST"])(login)
auth_bp.route("/me",       methods=["GET"])(me)