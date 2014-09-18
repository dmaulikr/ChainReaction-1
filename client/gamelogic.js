(function(){
	Grid = function(players, m, n, div, position, clicked){
		this.m = m;
		this.n = n;
		this.turn = 0;
		this.position = position;
		this.numberOfPlayers = players.length;
		this.players = players;
		this.div = div;
		this.clicked = clicked;
		var grid = this.grid = [];
		this.playerQueue = [];
		for(var i=0;i<this.numberOfPlayers;i++){
			this.playerQueue[i]=i;
		}
	
		for(var i=0;i<this.m;i++){
			grid[i] = [];
			for(var j=0;j<this.n;j++){
				var capacity = 4;
				if(i==0)capacity--;
				if(j==0)capacity--;
				if(i==this.m-1)capacity--;
				if(j==this.n-1)capacity--;
				
				grid[i][j]={
						player:-1,
						count:0,
						capacity:capacity
				};
			}
		}
		var playerColors = ["red","green","blue","white"];
		var updateCount = function(i,j){
			var item = grid[i][j];
			item.player = this.turn;
			var cnt = ++item.count;
			var capacity = item.capacity;
			if(cnt>=capacity)cnt=capacity;
			
			var color=playerColors[item.player];
			if(cnt == 1){
				item.element.innerHTML = "<div class='circle' style='background:"+color+";'>";
			}
			else if(cnt == 2){
				item.element.innerHTML = "<div class='circle' style='background:"+color+";margin-left:-10px;'><div class='circle inner' style='background:"+color+";margin-left:10px;'></div></div>";
			}
			else if(cnt == 3){
				item.element.innerHTML = "<div class='circle' style='background:"+color+";margin-left:-10px;margin-top:3px;'><div class='circle inner' style='background:"+color+";margin-left:10px;'><div class='circle inner' style='background:"+color+";margin-top:-9px;margin-left:-5px;'></div></div></div>";
			}
			else if(cnt == 4){
				item.element.innerHTML = "<div class='circle' style='background:"+color+";margin-left:-10px;margin-top:-10px;'><div class='circle inner' style='background:"+color+";margin-left:10px;'><div class='circle inner' style='background:"+color+";margin-top:10px;margin-left:-10px;'><div class='circle inner' style='background:"+color+";margin-left:10px;'></div></div></div></div>";
			}
			return cnt>=capacity;
		}
		var addToSet = function(set, i, j){
			for(var k=0;k<set.length;k++){
				var ele = set[k];
				if(ele.i == i && ele.j == j)return;
			}
			set.push({i:i,j:j});
		}
		var locked = false;
		var over = false;
		
		function gameOver(){
			over = true;
		}
		function isGameOver(){
			return over;
		}
	
		function lock(){
			locked=true;
		}
		function releaseLock(){
			locked=false;
		}
		function isLocked(){
			return locked;
		}
		function getActivePlayers(){
			var activePlayers = [];
			for(var i=0;i<this.m;i++){
				for(var j=0;j<this.n;j++){
					var player = grid[i][j].player;
					for(var k=0;k<activePlayers.length;k++){
						if(activePlayers[k]==player){
							player = -1;
							break;
						}
					}
					if(player != -1) activePlayers.push(player);
				}
			}
			return activePlayers;
		}
		function getDifference(b, a){
			var diff = [];
			for(var i=0;i<b.length;i++){
				var index = a.indexOf(b[i]);
				if(index<0){
					diff.push(b[i])
				}
			}
			for(var i=0;i<diff.length;i++){
				var index=b.indexOf(diff[i])
				b.splice(index,1)
			}
			return diff;
		}
		function strikeOut(elements,div){
			for(var i=0;i<elements.length;i++){
				var element = elements[i];
				div.childNodes[element].innerHTML="<del>"+div.childNodes[element].innerHTML+"</del>";
			}
		}
		var gameStarted = false;
		
		function endOfTurn(){
			if(this.turn == numberOfPlayers-1)gameStarted=true;
			
			if(gameStarted){
				var players = getActivePlayers();
				var knockedPlayers = getDifference(this.playerQueue, players);
				
				// TODO points cause of knocked players
				if(knockedPlayers.length > 0){
					strikeOut(knockedPlayers, this.playerNames);
				}
				if(this.playerQueue.length == 1){
					gameOver();
				}
			}
			
			this.turn = this.playerQueue[(this.playerQueue.indexOf(this.turn)+1)%this.playerQueue.length];
			
			this.table.style.borderColor = playerColors[this.turn];
			releaseLock();
			
			processUndoneQueue();
		}
		
		var burst = function(queue){
			var set = [];
			for(var k=0;k<queue.length;k++){
				element = queue[k];
				var i = element.i;
				var j = element.j;
				
				grid[i][j].count=0;
				grid[i][j].player=-1;
				
				grid[i][j].element.innerHTML = "";
				if(i>0){
					if(updateCount(i-1,j)){
						addToSet(set, i-1, j)
					}
				}
				if(element.i<this.m-1){
					if(updateCount(i+1,j)){
						addToSet(set, i+1, j)
					}
				}
				if(element.j>0){
					if(updateCount(i,j-1)){
						addToSet(set, i, j-1)
					}
				}
				if(element.j<this.n-1){
					if(updateCount(i,j+1)){
						addToSet(set, i, j+1)
					}
				}
			}
			if(set.length>0)
				setTimeout(burst,500,set);
			else 
				endOfTurn();
		}
		
		var lastMove = null;
		
		var add = function(i, j){
			item = grid[i][j];
			
			if(item.player != -1 && item.player != this.turn){
				releaseLock();
				return false;
			}
			
			if(lastMove!=null){
				grid[lastMove.i][lastMove.j].element.style.backgroundColor="";
			}
			lastMove = {
					i:i,
					j:j
			}
			grid[i][j].element.style.backgroundColor="silver";
			
			if(updateCount(i,j)){
				var queue = [{i:i,j:j}];
				burst(queue);
			} else {
				endOfTurn();
			}
			
			return true;
		}
		
		this.renderDiv = function(){
			var table = document.createElement("table");
			this.table = table;
			table.style.backgroundColor="black";
			table.style.display="inline-block";
			table.border = 1;
			for(var i=0;i<this.m;i++){
				var row = document.createElement("tr");
				for(var j=0;j<this.n;j++){
					var col = document.createElement("td");
					grid[i][j].element = col;
					col.width = "50px";
					col.height = "50px";
					col.align="center";
					col.i = i;
					col.j = j;
					var handle = this;
					col.onclick = function(){
						if(handle.turn == handle.position){
							handle.clicked(this.i, this.j);
						}
					}
					row.appendChild(col);
				}
				table.appendChild(row);
			}
			this.div.innerHTML = "";
			this.div.style.display="inline-block";
			this.div.appendChild(table);
			var players = document.createElement("div");
			for(var i=0;i<this.numberOfPlayers;i++){
				var player = document.createElement("div");
				player.innerHTML=this.players[i];
				player.style.backgroundColor = playerColors[i];
				players.appendChild(player)
			}
			this.div.appendChild(players);
			this.playerNames=players;
			
			this.turn=-1;
			endOfTurn();
		}
		this.undoneQueue=[];
		this.move = function(player, i, j){
			if(isLocked() || isGameOver()){
				if(isLocked()){
					undoneQueue.push({
						player:player,
						i:i,
						j:j
					});
				}
				return;
			}
			lock();
			
			// TODO check if player is valid in this state
			this.turn = player;
			add(i, j);
		}
		function processUndoneQueue(){
			if(undoneQueue.length>0){
				var obj = undoneQueue.shift();
				if(obj.i){
					this.move(obj.player, obj.i, obj.j);
				} else {
					this.disconnected(obj.player);
				}
			}
		}
		this.disconnected = function(player){
			if(isLocked() || isGameOver()){
				if(isLocked()){
					undoneQueue.push({
						player:player
					});
				}
				return;
			}
			
			for(var i=0;i<this.m;i++){
				for(var j=0;j<this.n;j++){
					if(grid[i][j].player == player){
						grid[i][j].player=-1;
						grid[i][j].count=0;
						grid[i][j].element.innerHTML="";
					}
				}
			}
			
			if(this.turn == player){
				endOfTurn();
			}
			else {
				// remove from queue
				var index = this.playerQueue.indexOf(player)
				this.playerQueue.splice(player, 1)
				
				var knockedPlayers = [player];
				
				strikeOut(knockedPlayers, this.playerNames);
				if(this.playerQueue.length <= 1){
					gameOver();
				}
			}
		}
		return this;
	}
})();