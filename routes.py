from unamed_musicapp import app
from flask import render_template


@app.route('/')
def index():
    return render_template('_layouts/index.html'), 200
    