//socket = new WebSocket("ws://localhost:3000/");
socket = new WebSocket("ws://akshaylive-cs523-assignment1.jit.su:80/");
var gameState = {
		players:[]
}

var grid;

socket.onmessage = function(message) {
	message = JSON.parse(message.data);
	switch(message.action){
		case "start":
			grid = Grid(gameState.players, message.m, message.n, document.getElementById("grid"),gameState.position, function(i,j){
				socket.send('{"action":"move","i":'+i+',"j":'+j+'}');
			});
			grid.renderDiv();
			break;
		case "position":
			gameState.position=message.position;
			break;
		case "joined":
			gameState.players[message.position]=message.name;
			break;
		case "moved":
			grid.move(message.position, message.i, message.j);
			break;
		case "disconnected":
			grid.disconnected(message.position);
			break;
		default:
			console.log("unknown action: "+message.action)
	}
	
};




function join(){
	var name = document.getElementById("playerName").value;
	// TODO encodings
	socket.send('{"action":"join","name":"'+name+'"}');
}