from flask import Flask, render_template
from flask_socketio import SocketIO,emit
import sys
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('_layouts/index.html'), 200


@socketio.on('my event', namespace='/test')
def test_message(message):
    emit('my response', {'data': message['data']})

@socketio.on('my broadcast event', namespace='/test')
def test_message(message):
    emit('my response', {'data': message['data']}, broadcast=True)

@socketio.on('connect', namespace='/test')
def test_connect():
    print('connected',file=sys.stderr)
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected', file=sys.stderr)

if __name__ == '__main__':
    app.debug=True
    socketio.run(app,host='localhost')
