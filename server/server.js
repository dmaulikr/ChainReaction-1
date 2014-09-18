var ws = require('websocket.io')
  , http = require('http').createServer().listen(3000)
  , server = ws.attach(http);


// GAME OBJECT
//   state: waiting/start
//   clients: list of clients and position

// Messages
//  join, name
//    xyz joined, position
//    you are color
//    start
//  terminated: person terminated, remove him
//  play coordinates


var states = {
	WAITING:0,
	START:1
};

var games = [];
function findEmptyGame(){
	for(var i=0;i<games.length;i++){
		if(games[i].state==states.WAITING){
			return games[i];
		}
	}
	var empty = {
			state:states.WAITING,
			clients:[]
	};
	games.push(empty);
	return empty;
}



// 1. when new connects check waiting games and add. TODO put max limits later
// 2. when 2 players exists in waiting, put a timeout of 10s to START.

server.on('connection', function(client){
	client.on('message', function(data){
	  var message = JSON.parse(data);
	  switch(message.action){
		  case "join":
			  if(client.game!=null){
				  var index = client.game.clients.indexOf(client)
				  client.game.clients.splice(index, 1)
				  client.game=null
			  }
			  var name = message.name;
			  var game = findEmptyGame();
			  game.clients.push(client);
			  var position = game.clients.length - 1;
			  client.game = game;
			  client.name = name;
			  
			  for(var i=0;i<game.clients.length - 1;i++){
				  var player=game.clients[i];
				  player.send('{"action":"joined", "name":"'+name+'","position":'+position+'}');
				  client.send('{"action":"joined", "name":"'+player.name+'","position":'+i+'}');
			  }
			  client.send('{"action":"joined", "name":"'+client.name+'","position":'+position+'}');
			  client.send('{"action":"position","position":'+position+'}')
			  
			  if(position == 1){
				  game.state = states.START
				  for(var i=0;i<game.clients.length;i++){
					  var player=game.clients[i];
					  player.send('{"action":"start","m":6,"n":5}')
				  }
			  }
			  
			  break;
		  case "move":
			  var position = client.game.clients.indexOf(client);

			  for(var i=0;i<client.game.clients.length;i++){
				  var player=client.game.clients[i];
				  player.send('{"action":"moved","i":'+message.i+',"j":'+message.j+',"position":'+position+'}')
			  }
			  break;
	  }
  });
  
  var close = function(e){
	if(client.game){
		var index = client.game.clients.indexOf(client)
		client.game.clients.splice(index, 1);
		for(var i=0;i<client.game.clients.length;i++){
			  var player=client.game.clients[i];
			  player.send('{"action":"disconnected","position":'+index+'}')
		}
	}
  }
  
  client.on('close', close);
  client.on('error', close);
});