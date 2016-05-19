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
	constructor(protected id: number, protected imageString: string, mass: number) {
		this.sprite = game.thingsGroup.create(0, 0, this.imageString);
		this.sprite['thing'] = this;
		game.physics.arcade.enable(this.sprite);
		this.targetMass = mass;
		this.sprite.body.mass = mass;
		this.sprite.body.collideWorldBounds = true;
		this.sprite.body.bounce.setTo(0.5, 0.5);
		this.massChanged();
	}

	setPosition(x: number, y: number): void {
		if (!this.sprite)
			return;
		this.sprite.x = x;
		this.sprite.y = y;
	}

	setScale(scale: number): void {
		if (!this.sprite)
			return;
		this.sprite.scale.x = this.sprite.scale.y = scale;
	}

	setVelocity(v: Phaser.Point): void {
		if (!this.sprite)
			return;
		this.sprite.body.velocity = v;
	}

	changeVelocityX(x: number): void {
		if (!this.sprite)
			return;
		this.sprite.body.velocity.x += x;
	}

	changeVelocityY(y: number): void {
		if (!this.sprite)
			return;
		this.sprite.body.velocity.y += y;
	}

	setController(controller: Controller): void {
		this.controller = controller;
	}

	massChanged(): void {
		const scaleFactor: number = 0.15;
		let size = Math.sqrt(this.sprite.body.mass / Math.PI);
		this.setScale(size * scaleFactor);
	}

	onCollide(otherThing: Thingy): void {
		const deathThreshold: number = 1.2;
		if (this.sprite.body.mass > otherThing.sprite.body.mass) {
			let ratio = this.sprite.body.mass / otherThing.sprite.body.mass;
			if (ratio > deathThreshold) {
				this.targetMass += otherThing.sprite.body.mass;
				otherThing.die();
			}
		} else if (otherThing.sprite.body.mass > this.sprite.body.mass) {
			let ratio = otherThing.sprite.body.mass / this.sprite.body.mass;
			if (ratio > deathThreshold) {
				otherThing.targetMass += this.sprite.body.mass;
				this.die();
			}
		}
	}
	
	die(): void {
		this.sprite.body.mass = 0;
		this.massChanged();
		if (this.sprite) {
			this.sprite.kill();
			game.thingsGroup.remove(this.sprite);
			this.sprite.body.enable = false;
			this.sprite = null;
		}
	}

	update(): void {
		if (this.controller)
			this.controller.update(this);
		if (!this.sprite)
			return;
		let massDelta: number = this.targetMass - this.sprite.body.mass;
		if (massDelta) {
			this.sprite.body.mass += massDelta / 20;
			this.massChanged();
		}
	}

	render(): void {
		if (!this.sprite)
			return;
		//game.debug.body(this.sprite);
	}

	protected sprite: Phaser.Sprite;
	protected controller: Controller;
	protected targetMass: number;
};

class RunState extends Phaser.State {
	preload(): void {
		this.load.image('bluesphere', 'art/bluesphere.png');
		this.load.image('redsphere', 'art/redsphere.png');
	}

	create(): void {
		const maxNumThings: number = 100;

		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.thingsGroup = game.add.group();

		let aiController: AIController = new AIController(this.game.rnd);
		let cursorController: CursorController = new CursorController(this.game.input.keyboard.createCursorKeys());

		while (this.things.length < maxNumThings) {
			let isPlayer: boolean = (this.things.length == 0);
			let imageString: string = isPlayer ? 'bluesphere' : 'redsphere';
			let mass: number = isPlayer ? 3.0 : game.rnd.realInRange(0.75, 1.25);
			let x: number = isPlayer ? (game.width / 2) : game.rnd.integerInRange(50, game.width - 100);
			let y: number = isPlayer ? (game.height / 2) : game.rnd.integerInRange(50, game.height - 100);
			let controller: Controller = isPlayer ? cursorController : aiController;

			let thing: Thingy = new Thingy(this.things.length, imageString, mass);
			thing.setPosition(x, y);
			thing.setController(controller);
			this.things.push(thing);
		}
	}

	collisionCallback(s1, s2): void {
		let thing1: Thingy = s1.thing;
		let thing2: Thingy = s2.thing;
		thing1.onCollide(thing2);
	}

	update(): void {
		if (this.things.length > 0) {
			for (let thing of this.things) {
				thing.update();
			}

			game.physics.arcade.collide(game.thingsGroup, game.thingsGroup, this.collisionCallback);
		}
	}

	render(): void {
		for (let thing of this.things) {
			thing.render();
		}
	}

	protected things: Thingy[] = [];
};

class Game extends Phaser.Game {
    constructor() {
		super("95%", "95%", Phaser.AUTO, 'game');

		this.state.add('RunState', RunState, false);
		this.state.start('RunState');
	}

	thingsGroup: Phaser.Group;
};

window.onload = () => {
	game = new Game();
};