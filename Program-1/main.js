//Sam Kocher (main.js)
//Program-1
//CMPS 4443 - Summer 1 2016
//Due: 6/12/2016

var mainState = {

    preload: function() {
        game.load.image('player', 'assets/player3.png');
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        game.load.image('coin', 'assets/money.png');
        game.load.image('enemy', 'assets/enemy.png');
    },

    create: function() { 
        game.stage.backgroundColor = '#3498db';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.renderer.renderSession.roundPixels = true;

        this.cursor = game.input.keyboard.createCursorKeys();
        
		//Adds the player to the game w/ attributes
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;

        this.createWorld();
		
		//Adds currency to the game board
        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);

		//Score Label
        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        this.score = 0;
		
		//Displays the amount of time left in the game
		this.timeLabel = game.add.text(310, 30, 'Time until Death: 120', { font: '18px Arial', fill: '#ffffff' });
        this.timer = 120;
		
		//Displays the number of times the player dies
		this.deathCount = game.add.text(390, 300, 'Deaths: 0', { font: '18px Arial', fill: '#ffffff' });
		this.deaths = 0;
		
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
		game.time.events.loop(1000, this.updateTimer, this)
    },

    update: function() {
        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
		

        this.movePlayer(); 

        if (!this.player.inWorld) {
            this.playerDie();
        }
    },

    movePlayer: function() {
        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = -200;
        }
        else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 200;
        }
        else {
            this.player.body.velocity.x = 0;
        }

        if (this.cursor.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -320;
        }      
    },

    takeCoin: function(player, coin) {
        this.score += 5;
        this.scoreLabel.text = 'score: ' + this.score;

        this.updateCoinPosition();
    },

    updateCoinPosition: function() {
        var coinPosition = [
            {x: 140, y: 60}, {x: 360, y: 60}, 
            {x: 60, y: 140}, {x: 440, y: 140}, 
            {x: 130, y: 300}, {x: 370, y: 300} 
        ];

        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x == this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }

        var newPosition = game.rnd.pick(coinPosition);
        this.coin.reset(newPosition.x, newPosition.y);
    },
	
	//Respawns the player in a "random" location where the player should be relatively safe and able to react prior to dying again
	updatePlayerPosition: function() {
        var playPosition = [
            {x: 190, y: 120}, {x: 290, y: 120}, 
            {x: 140, y: 120}, {x: 460, y: 30}, 
            {x: 40, y: 200}, {x: 430, y: 340},
			{x: 240, y: 120}, {x: 30, y: 30},
			{x: 460, y: 200} 
        ];

        for (var j = 0; j < playPosition.length; j++) {
            if (playPosition[j].x == this.player.x) {
                playPosition.splice(j, 1);
            }
        }

        var nPosition = game.rnd.pick(playPosition);
        this.player.reset(nPosition.x, nPosition.y);
    },
	
	//Updates the game timer each second, when the timer reaches zero, the game restarts.
	updateTimer: function() {
		this.timer -= 1;
		this.timeLabel.text = 'Time until Death: ' + this.timer;
		if(this.timer==0) game.state.start('main');
	},

    addEnemy: function() {
        var enemy = this.enemies.getFirstDead();

        if (!enemy) {
            return;
        }

        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.width/2, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },

    createWorld: function() {
        this.walls = game.add.group();
        this.walls.enableBody = true;

        game.add.sprite(0, 0, 'wallV', 0, this.walls); 
        game.add.sprite(480, 0, 'wallV', 0, this.walls); 
        game.add.sprite(0, 0, 'wallH', 0, this.walls); 
        game.add.sprite(300, 0, 'wallH', 0, this.walls);
        game.add.sprite(0, 320, 'wallH', 0, this.walls); 
        game.add.sprite(300, 320, 'wallH', 0, this.walls); 
        game.add.sprite(-100, 160, 'wallH', 0, this.walls); 
        game.add.sprite(400, 160, 'wallH', 0, this.walls); 
        var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);

        this.walls.setAll('body.immovable', true);
    },
	
	//When the player dies, they are removed from the game and respawn in a random location.
	//A death is added to the counter.
    playerDie: function() {
        this.player.kill();
		this.deaths += 1;
		this.deathCount.text = 'Deaths: ' + this.deaths;
		
		this.updatePlayerPosition();
    },
};

var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');