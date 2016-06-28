var SpaceHipster = SpaceHipster || {};

var skillLevel = "Easy";
var asteroidSize
var bulletTime = 0;
var bullet;
var bullets;
//title screen
SpaceHipster.Game = function(){};



SpaceHipster.Game.prototype = {
  create: function() {
  	//set world dimensions
    this.game.world.setBounds(0, 0, 1920, 1920);

    //background
    this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

    //create player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
    this.player.scale.setTo(0.45);
	this.player.anchor.set(0.5);
	

    //player initial score of zero
    this.playerScore = 0;

    //enable player physics
    this.game.physics.arcade.enable(this.player);
    this.playerSpeed = 120;
    this.player.body.collideWorldBounds = true;
	this.player.body.drag.set(100);
    this.player.body.maxVelocity.set(200);
	
	
	
	  this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 20; i++)
    {
        var b = this.bullets.create(0, 0, 'bullet');
        b.name = 'bullet' + i;
        b.exists = false;
        b.visible = false;
        b.checkWorldBounds = true;
        b.events.onOutOfBounds.add(this.resetBullet, this);
    }
	
	
	

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //generate game elements
    this.generateCollectables();
    this.generateAsteriods();

    //show score
    this.showLabels();
	
	//Game input
    cursors = this.game.input.keyboard.createCursorKeys();
    fireButton = this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

    //sounds
    this.explosionSound = this.game.add.audio('explosion');
    console.log(this.explosionSound);
    this.collectSound = this.game.add.audio('collect');
  },
  update: function() {
	//movement
	if (cursors.up.isDown)
	{
		this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
	}
	else
	{
		this.player.body.acceleration.set(0);
	}

	if (cursors.left.isDown)
	{
		this.player.body.angularVelocity = -300;
	}
	else if (cursors.right.isDown)
	{
		this.player.body.angularVelocity = 300;
	}
	else
	{
		this.player.body.angularVelocity = 0;
	}
	
	//  Firing?
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        this.fireBullet();
    }
	
	//collision between bullets and asteroids
	this.game.physics.arcade.overlap(this.bullets, this.asteroids, this.shootAsteroid, null, this);
	
    //collision between player and asteroids
    this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);
	
    //overlapping between player and collectables
    this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
  },
  
  fireBullet: function () {
	if(this.game.time.now > bulletTime)
	{
		bullet = this.bullets.getFirstExists(false);

		if (bullet)
		{
			bullet.reset(this.player.body.x + 50, this.player.body.y + 48);
			bullet.lifespan = 2000;
			bullet.rotation = this.player.rotation;
			this.game.physics.arcade.velocityFromRotation(this.player.rotation, 400, bullet.body.velocity);
			
			
			bulletTime = this.game.time.now + 50;
		}
	}
  },
  
  generateCollectables: function() {
    this.collectables = this.game.add.group();

    //enable physics in them
    this.collectables.enableBody = true;
    this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    var numCollectables = this.game.rnd.integerInRange(100, 150)
    var collectable;

    for (var i = 0; i < numCollectables; i++) {
      //add sprite
      collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
      collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
      collectable.animations.play('fly');
    }

  },
  //creates a single asteroid of a "random" size and assigns a velocity based on the size
  generateAsteroid: function() {
	  var asteroid;
	  var randomInt = this.game.rnd.integerInRange(0, 100);
	  var randomInt2 = this.game.rnd.integerInRange(0, 100);
	  if(randomInt >= 0 && randomInt <= 12)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(16/42);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(-280, -260);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-80, 80);
		
	  }
	  else if(randomInt >= 13 && randomInt <= 25)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(9/21);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(260, 280);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-80, 80);
		
	  }
	  else if(randomInt >= 26 && randomInt <= 38)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(12/21);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(-240, 240);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-270, -250);
		
	  }
	  else if(randomInt >= 39 && randomInt <= 50)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(15/21);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(-200, -220);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(200, 220);
		
	  }
	  else if(randomInt >= 51 && randomInt <= 60)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(1);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(150, 280);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-260, 180);
		
	  }
	  else if(randomInt >= 61 && randomInt <= 70)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(1.6);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(-140, 300);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-380, 380);
		
	  }
	  else if(randomInt >= 71 && randomInt <= 78)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(2);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(140, 260);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-300, 380);
		
	  }
	  else if(randomInt >= 71 && randomInt <= 85)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(2.3);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(-400, 300);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-390, 200);
		
	  }
	  else if(randomInt >= 86 && randomInt <= 93)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(2.6);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(-300, 310);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-300, 322);
		
	  }
	  else if(randomInt >= 94 && randomInt <= 100)
	  {
		asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        asteroid.scale.setTo(3);
		asteroid.body.velocity.x = this.game.rnd.integerInRange(-400, 400);
	    asteroid.body.velocity.y = this.game.rnd.integerInRange(-50, 50);
	  }
	  asteroid.body.immovable = true;
	  asteroid.body.collideWorldBounds = true;
	  asteroid.body.bounce.setTo(0.9, 0.9);
  },
  //Creates a random number of asteroids, bounded by difficulty
  generateAsteriods: function() {
    this.asteroids = this.game.add.group();
    
    //enable physics in them
    this.asteroids.enableBody = true;
	
	//Bounding variables for the number of asteroids to be generated based on difficulty
	var lowerBound;
	var upperBound;
	
	if(skillLevel == "Easy")
	{ 	lowerBound = 25;
		upperBound = 50;}
	else if(skillLevel == "Medium")
	{	lowerBound = 50;
		upperBound = 150;}
	else if(skillLevel == "Hard")
	{	lowerBound = 150;
		upperBound = 220;}
	
    //phaser's random number generator
    var numAsteroids = this.game.rnd.integerInRange(lowerBound, upperBound);
    var asteroid;

    for (var i = 0; i < numAsteroids; i++) {
      //create asteroids
	  this.generateAsteroid();
    }
  },
  hitAsteroid: function(player, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    this.player.kill();

    this.game.time.events.add(800, this.gameOver, this);
  },
  //destroy asteroid and bullet that collides with the asteroid
  shootAsteroid: function(bullets, asteroid){
	var emitter = this.game.add.emitter(asteroid.x, asteroid.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    asteroid.kill();
	bullets.kill();
	console.log(this.asteroid);
  },
   resetBullet: function (bullet) {

    bullet.kill();

},
  
  gameOver: function() {    
    //pass it the score as a parameter 
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },
  collect: function(player, collectable) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore++;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    collectable.destroy();
  },
  showLabels: function() {
    //score text
    var text = "0";
    var style = { font: "20px Arial", fill: "#fff", align: "center" };
    this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
  }
};

/*
TODO

-audio
-asteroid bounch
*/
