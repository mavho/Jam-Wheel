from flask import Flask, render_template, request, session,url_for
from flask_socketio import SocketIO,emit, join_room, leave_room, rooms
from flask_sqlalchemy import SQLAlchemy
import sys,requests
from config import Config
from shared_state import SharedState

app = Flask(__name__)
app.config.from_object(Config)
socketio = SocketIO(app)
db = SQLAlchemy(app)

sk =app.config.get('SECRET_KEY')
addr = 'localhost',5000

ss = SharedState(addr,sk)

### sid: (user,room)
sid_username_room = {}
### room_name: [u1,u2...]
room_list = {}

@app.route('/')
def index():
    return render_template('_includes/landing_page.html'), 200

@app.route('/game')
def game():
    return render_template('_includes/circle_beta.html'), 200

@app.route('/debug')
def dbug():
    return render_template('_includes/debug.html'), 200


def isDupUser(room,user_name):
    for user in room_list[room]:
        if user == user_name:
            return True 
    return False 

@socketio.on('join room', namespace='/test_room')
def join(payload):
    room = payload['room'] 
    user_name = payload['user_name']

    if room not in room_list:
        room_list[room] = [user_name]
        join_room(room)
        emit('join room', {'success':True,'room':room,'user':user_name,'url': url_for('game')}, broadcast=False)
    elif isDupUser(room,user_name):
        emit('join room', {'success':False,'room':room,'user':user_name},broadcast=False,include_self=True)
        return
    else:
        join_room(room)
        room_list[room].append(user_name)
        emit('join room', {'success':True,'room':room,'user':user_name,'url': url_for('game')}, broadcast=False)

    if request.sid not in sid_username_room:
        sid_username_room[request.sid] = (user_name,room)
    
    print(request.sid + ' joined ' + room,file=sys.stdout)
    emit('join room', {'room':room,'users':room_list[room]},room=room,include_self=True)

@socketio.on('press key',namespace='/test_room')
def press_key(payload):
    room = payload['channel']
    user_name = payload['user_name']
    note = payload['note']
    instrument = payload['type']
    emit('press key',{'note':note, 'type':instrument, 'room':room, 'user_name':user_name}, room=room, include_self=False)

@socketio.on('release key', namespace='/test_room')
def release_key(payload):
    room = payload['channel'] 
    user_name = payload['user_name']
    emit('release key',{'room':room, 'user_name':user_name}, room=room,include_self=False)


@socketio.on('connect', namespace='/test_room')
def test_connect():
    print(request.sid + ' connected',file=sys.stdout)
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/test_room')
def test_disconnect():
    print(request.sid + ' Client disconnected',file=sys.stdout)
    if request.sid in sid_username_room:
        data = sid_username_room[request.sid]
        #(user,room)
        leave_room(data[1])
        del sid_username_room[request.sid]
        for i in range(len(room_list[data[1]])):
            if room_list[data[1]][i] == data[0]:
                del room_list[data[1]][i]
                break
        emit('disconnect', {'user': data[0]}, room=data[1])

if __name__ == '__main__':
    print("Hello")
    app.debug=True
    socketio.run(app,host='localhost')
