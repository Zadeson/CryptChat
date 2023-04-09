from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, join_room, leave_room, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    username = request.form['username']
    password = request.form['password']
    room = request.form['room']
    # You can add your own authentication logic here
    return render_template('chat.html', username=username, room=room)

@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])
    socketio.emit("message", {"username": data["username"], "msg": "has joined the room.", "isServerMessage": True}, room=data["room"])



@socketio.on('leave_room')
def handle_leave_room_event(data):
    leave_room(data['room'])
    send({'msg': data['username'] + " has left the room."}, room=data['room'])

@socketio.on('send_message')
def handle_send_message_event(data):
    socketio.emit("message", {"username": data["username"], "msg": data["msg"], "isServerMessage": False}, room=data["room"])


@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])
    send({'msg': data['username'] + " has joined the room.", 'isServerMessage': True}, room=data['room'])

@socketio.on('leave_room')
def handle_leave_room_event(data):
    leave_room(data['room'])

room_messages = {} # Add this line to store messages for each room

@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])

    if data['room'] in room_messages:  # Add this block
        for msg in room_messages[data['room']]:
            send(msg, room=request.sid)  # Send past messages only to the new user, using request.sid
            
@socketio.on('send_message')
def handle_send_message_event(data):
    msg = {'username': data['username'], 'msg': data['msg']}
    if data['room'] not in room_messages: # Add this block
        room_messages[data['room']] = []
    room_messages[data['room']].append(msg)
    send(msg, room=data['room'])



if __name__ == '__main__':
    socketio.run(app)