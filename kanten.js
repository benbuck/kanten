/// <reference path="phaser.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game;
;
var CursorController = (function () {
    function CursorController(cursorKeys) {
        this.cursorKeys = cursorKeys;
    }
    CursorController.prototype.update = function (thing) {
        var v = 5.0;
        if (this.cursorKeys.left.isDown)
            thing.changeVelocityX(-v);
        if (this.cursorKeys.right.isDown)
            thing.changeVelocityX(v);
        if (this.cursorKeys.down.isDown)
            thing.changeVelocityY(v);
        if (this.cursorKeys.up.isDown)
            thing.changeVelocityY(-v);
    };
    return CursorController;
}());
;
var AIController = (function () {
    function AIController(rnd) {
        this.rnd = rnd;
    }
    AIController.prototype.update = function (thing) {
        var v = 10.0;
        var vx = this.rnd.realInRange(-v, v);
        thing.changeVelocityX(vx);
        var vy = this.rnd.realInRange(-v, v);
        thing.changeVelocityY(vy);
    };
    return AIController;
}());
;
var Thingy = (function () {
    function Thingy(id, imageString, mass) {
        this.id = id;
        this.imageString = imageString;
        this.sprite = game.thingsGroup.create(0, 0, this.imageString);
        this.sprite['thing'] = this;
        game.physics.arcade.enable(this.sprite);
        this.targetMass = mass;
        this.sprite.body.mass = mass;
        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.bounce.setTo(0.5, 0.5);
        this.massChanged();
    }
    Thingy.prototype.setPosition = function (x, y) {
        if (!this.sprite)
            return;
        this.sprite.x = x;
        this.sprite.y = y;
    };
    Thingy.prototype.setScale = function (scale) {
        if (!this.sprite)
            return;
        this.sprite.scale.x = this.sprite.scale.y = scale;
    };
    Thingy.prototype.setVelocity = function (v) {
        if (!this.sprite)
            return;
        this.sprite.body.velocity = v;
    };
    Thingy.prototype.changeVelocityX = function (x) {
        if (!this.sprite)
            return;
        this.sprite.body.velocity.x += x;
    };
    Thingy.prototype.changeVelocityY = function (y) {
        if (!this.sprite)
            return;
        this.sprite.body.velocity.y += y;
    };
    Thingy.prototype.setController = function (controller) {
        this.controller = controller;
    };
    Thingy.prototype.massChanged = function () {
        var scaleFactor = 0.15;
        var size = Math.sqrt(this.sprite.body.mass / Math.PI);
        this.setScale(size * scaleFactor);
    };
    Thingy.prototype.onCollide = function (otherThing) {
        var deathThreshold = 1.2;
        if (this.sprite.body.mass > otherThing.sprite.body.mass) {
            var ratio = this.sprite.body.mass / otherThing.sprite.body.mass;
            if (ratio > deathThreshold) {
                this.targetMass += otherThing.sprite.body.mass;
                otherThing.die();
            }
        }
        else if (otherThing.sprite.body.mass > this.sprite.body.mass) {
            var ratio = otherThing.sprite.body.mass / this.sprite.body.mass;
            if (ratio > deathThreshold) {
                otherThing.targetMass += this.sprite.body.mass;
                this.die();
            }
        }
    };
    Thingy.prototype.die = function () {
        this.sprite.body.mass = 0;
        this.massChanged();
        if (this.sprite) {
            this.sprite.kill();
            game.thingsGroup.remove(this.sprite);
            this.sprite.body.enable = false;
            this.sprite = null;
        }
    };
    Thingy.prototype.update = function () {
        if (this.controller)
            this.controller.update(this);
        if (!this.sprite)
            return;
        var massDelta = this.targetMass - this.sprite.body.mass;
        if (massDelta) {
            this.sprite.body.mass += massDelta / 20;
            this.massChanged();
        }
    };
    Thingy.prototype.render = function () {
        if (!this.sprite)
            return;
        //game.debug.body(this.sprite);
    };
    return Thingy;
}());
;
var RunState = (function (_super) {
    __extends(RunState, _super);
    function RunState() {
        _super.apply(this, arguments);
        this.things = [];
    }
    RunState.prototype.preload = function () {
        this.load.image('bluesphere', 'art/bluesphere.png');
        this.load.image('redsphere', 'art/redsphere.png');
    };
    RunState.prototype.create = function () {
        var maxNumThings = 100;
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.thingsGroup = game.add.group();
        var aiController = new AIController(this.game.rnd);
        var cursorController = new CursorController(this.game.input.keyboard.createCursorKeys());
        while (this.things.length < maxNumThings) {
            var isPlayer = (this.things.length == 0);
            var imageString = isPlayer ? 'bluesphere' : 'redsphere';
            var mass = isPlayer ? 3.0 : game.rnd.realInRange(0.75, 1.25);
            var x = isPlayer ? (game.width / 2) : game.rnd.integerInRange(50, game.width - 100);
            var y = isPlayer ? (game.height / 2) : game.rnd.integerInRange(50, game.height - 100);
            var controller = isPlayer ? cursorController : aiController;
            var thing = new Thingy(this.things.length, imageString, mass);
            thing.setPosition(x, y);
            thing.setController(controller);
            this.things.push(thing);
        }
    };
    RunState.prototype.collisionCallback = function (s1, s2) {
        var thing1 = s1.thing;
        var thing2 = s2.thing;
        thing1.onCollide(thing2);
    };
    RunState.prototype.update = function () {
        if (this.things.length > 0) {
            for (var _i = 0, _a = this.things; _i < _a.length; _i++) {
                var thing = _a[_i];
                thing.update();
            }
            game.physics.arcade.collide(game.thingsGroup, game.thingsGroup, this.collisionCallback);
        }
    };
    RunState.prototype.render = function () {
        for (var _i = 0, _a = this.things; _i < _a.length; _i++) {
            var thing = _a[_i];
            thing.render();
        }
    };
    return RunState;
}(Phaser.State));
;
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        _super.call(this, "95%", "95%", Phaser.AUTO, 'game');
        this.state.add('RunState', RunState, false);
        this.state.start('RunState');
    }
    return Game;
}(Phaser.Game));
;
window.onload = function () {
    game = new Game();
};
//# sourceMappingURL=kanten.js.map