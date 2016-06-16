var game = new Phaser.Game(500, 340);

game.global = {
    score: 0
};

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

<<<<<<< HEAD
game.state.start('boot');
=======
game.state.start('boot');
>>>>>>> c5b708c802bff351359d9c1e91fe00141febd701
