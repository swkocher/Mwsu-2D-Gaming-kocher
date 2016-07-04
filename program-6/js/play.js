
//====================================================================

var playState = {
    /** 
    * Establish eureca client and setup some globals
    */
    init: function(){
        //Add the server client for multiplayer
        this.client = new Eureca.Client();
        
        game.global.playerReady = false;

        game.global.dude = false;

    },
    /**
    * Calls the dude's update method
    */
    update: function() {
    	if (!game.global.dude) 
    	    return;
    	    
        
        game.global.dude.update();


    },
    /**
    * Initialize the multiPlayer methods
    * and bind some keys to variables
    */
    create: function(){
        this.initMultiPlayer(game,game.global);
        
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    },
    
    /**
    * Handles communication with the server
    */
    initMultiPlayer: function(game,globals){
        
        // Reference to our eureca so we can call functions back on the server
        var eurecaProxy;
        
        /**
        * Fires on initial connection
        */
        this.client.onConnect(function (connection) {
            console.log('Incoming connection', connection);
            
        });
        /**
        * When the connection is established and ready
        * we will set a local variable to the "serverProxy" 
        * sent back by the server side.
        */
        this.client.ready(function (serverProxy) {
             // Local reference to the server proxy to be 
             // used in other methods within this module.
             eurecaProxy = serverProxy;

        });
        
        /**
        * This sets the players id that we get from the server
        * It creates the instance of the player, and communicates
        * it's state information to the server.
        */
        this.client.exports.setId = function(id){
            console.log("Setting Id:" + id);

            // Assign my new connection Id
            globals.myId = id;
            
            // Create new "dude"
            globals.dude = new Enemy(id, game,eurecaProxy);
            
            // Put instance of "dude" into list
            globals.playerList[id] = globals.dude;
            
            //Send state to server
            eurecaProxy.initPlayer(id,globals.dude.state);
            
            // debugging
            console.log(globals.playerList);

            // Were ready to go
            globals.playerReady = true;
            
            // Send a handshake to say hello to other players.
            eurecaProxy.handshake();
            

            
        }
        /**
        * Called from server when another player "disconnects"
        */
        this.client.exports.kill = function(id){	
            if (globals.playerList[id]) {
                globals.playerList[id].kill();
                console.log('killing ', id, globals.playerList[id]);
            }
        }	
        /**
        * This is called from the server to spawn enemy's in the local game
        * instance.
        */
        this.client.exports.spawnEnemy = function(id, enemy_state, x, y){
            
            if (id == globals.myId){
                return; //this is me
            }
			
            console.log('Spawning New Player');
			if(!globals.playerList[id]){
				var en = new Enemy(id, game);
				en.sprite.tint = enemy_state.tint;
				globals.playerList[id] = en;
			}
			
    
            //globals.playerList[id] = enemy_state;
            //console.log("this is the enemy state: " + enemy_state, "ID: " + id);
            console.log(globals.playerList);

        }

        /**
        * This is called from the server to update a particular players
        * state. 
        */       
        this.client.exports.updateState = function(id,player_state){
            console.log(id,player_state);
            
            // Don't do anything if its me
            if(globals.myId == id){
                return;
            }
            
            // If player exists, update that players state. 
            if (globals.playerList[id])  {
                globals.playerList[id].sprite.x = player_state.x;
				globals.playerList[id].sprite.y = player_state.y;
            }
         }
         
        
    },
    /**
    * Not used
    */
    render: function(){
       
    },
    /**
    * Not used, but could be called to go back to the menu.
    */
    startMenu: function() {
        game.state.start('menu');
    },
};
//gives character attributes to each player/enemy as they spawn
function Enemy(index, game, proxyServer) {
    
    this.x = 0;
    this.y = 0;
    this.old_x = this.x;
    this.old_y = this.y;

    this.game = game;
    
    this.player_id = index;
    
    
    this.alive = true;

    this.proxy = proxyServer;
    
	// randomly generates player tint
    this.tint = Math.random() * 0xffffff;                   
	
	//adds a sprite for the player and keeps track of its tint
    this.sprite = this.game.add.sprite(this.x, this.y, 'dude');
	this.sprite.tint = this.tint;

    this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    this.state = 
		{alive : true, 
		tint: this.tint,
		x : this.x,
		y : this.y};             

    this.health = 30;
    this.startTime = this.game.time.time;;
}


Enemy.prototype.update = function() {
	this.state.alive = this.alive;
	this.state.x = this.sprite.x;
    this.state.y = this.sprite.y;
	this.state.tint = this.tint;
    this.state.health = this.health;
    
    // Send your own state to server on your update and let
    // it do whatever with it. 
    this.proxy.handleState(this.player_id, this.state);

    if (this.upKey.isDown)
    {
        this.sprite.y-=3;
    }
    else if (this.downKey.isDown)
    {
        this.sprite.y+=3;
    }
	if (this.leftKey.isDown)
    {
        this.sprite.x-=3;
    }
    else if (this.rightKey.isDown)
    {
        this.sprite.x+=3;
    } 
    
    this.old_x = this.sprite.x;
    this.old_y = this.sprite.y;
};


Enemy.prototype.render = function() {

};
//used to remove players upon disconnect
Enemy.prototype.kill = function() {
    this.alive = false;
    this.sprite.kill();
};