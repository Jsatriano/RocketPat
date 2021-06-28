class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        this.load.image('rocket', './assets/my_rocket.png');
        this.load.image('spaceship', './assets/my_spaceship.png');
        //this.load.spritesheet('spaceship', './assets/my_spaceship_anim.png', {frameWidth: 63, frameHeight: 32, startFrame: 0, endFrame: 3});
        this.load.image('starfield', './assets/my_background.png');
        this.load.spritesheet('explosion', './assets/my_explosion.png', {frameWidth: 40, frameHeight: 32, startFrame: 0, endFrame: 3});
    }

    create() {
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);
        
        //green section of UI
        this.add.rectangle(0, borderUISize + borderPadding,
            game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);

        //white borders
        this.add.rectangle(0, 0, game.config.width,
            borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize,
            game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize,
            game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0,
            borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        
        //create rocket
        this.p1Rocket = new Rocket(this, game.config.width / 2, 
            game.config.height - (borderUISize + borderPadding) - 25, 'rocket').setOrigin(0.5, 0);
        //create spaceships
        this.anims.create({
            key: 'ship',
            frames: this.anims.generateFrameNumbers('spaceship', {start: 0, end: 3, first: 0}),
            framerate: 5
        });

        this.ship01 = new Spaceship(this, game.config.width + borderUISize * 6,
            borderUISize * 4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize * 3,
            borderUISize * 5 + borderPadding * 2, 'spaceship', 0, 20).setOrigin(0, 0);
        this.ship03 = new Spaceship(this, game.config.width, 
            borderUISize * 6 + borderPadding * 4, 'spaceship', 0, 10).setOrigin(0, 0);

        //add movement keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        //create explosion animation
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 3, first: 0}),
            frameRate: 10
        });

        this.p1Score = 0;

        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
              top: 5,
              bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding * 2, this.p1Score, scoreConfig);
        
        let fireConfig = {
            fontFamily: 'Courier',
            fontSize: '36px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'middle',
            padding: {
              top: 5,
              bottom: 5,
            },
            //fixedWidth: 90
        }
        
        
        this.fireText = this.add.text(borderUISize + borderPadding * 24, borderUISize + borderPadding * 2, 'FIRE', fireConfig);
        this.fireText.alpha = 0;
        
        //game over flag
        this.gameOver = false;
        //60 second play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or ← for Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);

    }

    update() {
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }
        this.starfield.tilePositionX -= 1.5;
        if(!this.gameOver) {
            this.p1Rocket.update();
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
        }

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03, Math.round(Math.random() * 5));
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02, Math.round(Math.random() * 5));
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01, Math.round(Math.random() * 5));
        }

        if(this.p1Rocket.isFiring) {
            this.fireText.alpha = 100;
        } else {
            this.fireText.alpha = 0;
        }
    }

    explosionRandom(number) {
        if(number == 1) {
            //play exp 1
            this.sound.play('sfx_explosion');
        }
        else if(number == 2) {
            //play exp 2
            this.sound.play('sfx_explosion2');
        }
        else if(number == 3) {
            //play exp 3
            this.sound.play('sfx_explosion3');
        }
        else if(number == 4) {
            //play exp 4
            this.sound.play('sfx_explosion4');
        }
        else {
            //play exp 5
            this.sound.play('sfx_explosion5');
        }
    }

    checkCollision(rocket, ship) {
        if(rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y) {
            return true;
        }
        return false;
    }

    shipExplode(ship, number) {
        ship.alpha = 0 //hide ship
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        this.explosionRandom(number);
        
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });
        //adds points to score
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
    }
}