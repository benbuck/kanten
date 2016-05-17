/// <reference path="phaser.d.ts"/>

let game: Game;

interface Controller {
	update(thing: Thingy): void;
};

class CursorController implements Controller {
	constructor(protected cursorKeys: Phaser.CursorKeys) {
	}

	update(thing: Thingy): void {
		const v: number = 5.0;
		if (this.cursorKeys.left.isDown)
			thing.changeVelocityX(-v);
		if (this.cursorKeys.right.isDown)
			thing.changeVelocityX(v);
		if (this.cursorKeys.down.isDown)
			thing.changeVelocityY(v);
		if (this.cursorKeys.up.isDown)
			thing.changeVelocityY(-v);
	}
};

class AIController implements Controller {
	constructor(protected rnd: Phaser.RandomDataGenerator) {
	}
	
	update(thing: Thingy): void {
		const v: number = 10.0;
		
		let vx: number = this.rnd.realInRange(-v, v);
		thing.changeVelocityX(vx);
		
		let vy: number = this.rnd.realInRange(-v, v);	
		thing.changeVelocityY(vy);
	}
};

class Thingy {
	constructor(protected imageString: string) {
		this.sprite = game.add.sprite(0, 0, this.imageString);
		
		game.physics.arcade.enable(this.sprite);
		this.sprite.body.collideWorldBounds = true;	
		this.sprite.body.bounce.setTo(0.2, 0.2);
	}

	setPosition(x: number, y: number): void {
		this.sprite.x = x;
		this.sprite.y = y;
	}

	setScale(scale: number): void {
		this.sprite.scale.x = this.sprite.scale.y = scale;
	}

	setVelocity(v: Phaser.Point): void {
		this.sprite.body.velocity = v;
	}

	changeVelocityX(x: number): void {
		this.sprite.body.velocity.x += x;
	}

	changeVelocityY(y: number): void {
		this.sprite.body.velocity.y += y;
	}
	
	setController(controller: Controller): void {
		this.controller = controller;
	}

	update(): void {
		if (this.controller)
			this.controller.update(this);
	}

	protected sprite: Phaser.Sprite;
	protected controller: Controller;
};

class RunState extends Phaser.State {
	preload(): void {
		this.load.image('bluesphere', 'art/bluesphere.png');
		this.load.image('redsphere', 'art/redsphere.png');
	}

	create(): void {
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		while (this.things.length < 10) {
			let isPlayer: boolean = (this.things.length == 0);		
			
			let thing: Thingy = new Thingy(isPlayer ? 'bluesphere' : 'redsphere');
			
			let x: number = isPlayer ? (game.width / 2) : game.rnd.integerInRange(50, game.width - 100);
			let y: number = isPlayer ? (game.height / 2) : game.rnd.integerInRange(50, game.height - 100);
			thing.setPosition(x,y);
			
			let scale: number = isPlayer ? 0.1 : game.rnd.realInRange(0.025, 0.2);
			thing.setScale(scale);
			
			thing.setController(isPlayer ? new CursorController(this.game.input.keyboard.createCursorKeys()) : new AIController(this.game.rnd));
			
			this.things.push(thing);
		}
	}

	update(): void {
		if (this.things.length > 0) {
			for (let thing of this.things) {
				thing.update();
			}
		}
	}

	render(): void {
	}

	protected things: Thingy[] = [];
};

class Game extends Phaser.Game {
    constructor() {
		super(800, 600, Phaser.AUTO, 'game');
		
		this.state.add('RunState', RunState, false);
		this.state.start('RunState');
	}
};

window.onload = () => {
	game = new Game();
};