from flask import Flask, render_template, request, session,url_for
from flask_socketio import SocketIO,emit, join_room, leave_room, rooms
from flask_sqlalchemy import SQLAlchemy
import sys,requests
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
socketio = SocketIO(app)
db = SQLAlchemy(app)


class Rooms(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(32),index=True)
    count = db.Column(db.Integer,index=True)

@app.route('/')
def index():
    return render_template('_includes/landing_page.html'), 200

@app.route('/game')
def game():
    return render_template('_includes/circle_beta.html'), 200


@socketio.on('join room', namespace='/test_room')
def join(payload):
    room = payload['room'] 
    user_name = payload['user_name']
    print(request.sid + ' joined ' + room, file=sys.stderr)
    join_room(room)
    emit('join room', {'room':room,'user':user_name, 'url': url_for('game')})

@socketio.on('press key',namespace='/test_room')
def key_handler(payload):
    room = payload['channel']
    user_name = payload['user_name']
    note = payload['note']
    emit('press key',{'note':note, 'room':room, 'user_name':user_name}, room=room)


@socketio.on('connect', namespace='/test_room')
def test_connect():
    print(request.sid + ' connected',file=sys.stderr)
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/test_room')
def test_disconnect():
    print(request.sid + ' Client disconnected', file=sys.stderr)

if __name__ == '__main__':
    app.debug=True
    socketio.run(app,host='localhost')
