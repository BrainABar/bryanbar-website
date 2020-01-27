from flask import render_template  # url_for, redirect, request
from frontend import app

@app.route("/index/")
@app.route("/")
def index():
    return render_template('pathfinder.html')


@app.route("/pathfinder/")
def pathfinder():
    return render_template('pathfinder.html')
