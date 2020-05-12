from flask import Flask, render_template, request, session
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
    return render_template('_includes/circle_beta.html'), 200


@socketio.on('join room', namespace='/test_room')
def join(payload):
    print(request.sid, file=sys.stderr)
    ### we randomly assign them to a room.
    open_room = Rooms.query.filter(Rooms.count < 4).first()
    ### currently just put them in the first possible room
    room = open_room.name 
    session['CURRENT_ROOM'] = open_room.name
    join_room(room)
    open_room.count += 1
    db.session.commit()
    emit('join room', {'room':room})

@socketio.on('press key',namespace='/test_room')
def key_handler(payload):
    room = payload['channel']
    note = payload['note']
    print(note,file=sys.stderr)
    emit('press key',{'note':note, 'room':room}, room=room)


@socketio.on('connect', namespace='/test_room')
def test_connect():
    print('connected',file=sys.stderr)
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/test_room')
def test_disconnect():
    print('Client disconnected', file=sys.stderr)
    if not session.get('CURRENT_ROOM') is None:
        room = Rooms.query.filter_by(name=session['CURRENT_ROOM']).first()
        room.count -= 1
        db.session.commit()

if __name__ == '__main__':
    app.debug=True
    socketio.run(app,host='localhost')
