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
    function Thingy(imageString) {
        this.imageString = imageString;
        this.sprite = game.add.sprite(0, 0, this.imageString);
        game.physics.arcade.enable(this.sprite);
        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.bounce.setTo(0.2, 0.2);
    }
    Thingy.prototype.setPosition = function (x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
    };
    Thingy.prototype.setScale = function (scale) {
        this.sprite.scale.x = this.sprite.scale.y = scale;
    };
    Thingy.prototype.setVelocity = function (v) {
        this.sprite.body.velocity = v;
    };
    Thingy.prototype.changeVelocityX = function (x) {
        this.sprite.body.velocity.x += x;
    };
    Thingy.prototype.changeVelocityY = function (y) {
        this.sprite.body.velocity.y += y;
    };
    Thingy.prototype.setController = function (controller) {
        this.controller = controller;
    };
    Thingy.prototype.update = function () {
        if (this.controller)
            this.controller.update(this);
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
        game.physics.startSystem(Phaser.Physics.ARCADE);
        while (this.things.length < 10) {
            var isPlayer = (this.things.length == 0);
            var thing = new Thingy(isPlayer ? 'bluesphere' : 'redsphere');
            var x = isPlayer ? (game.width / 2) : game.rnd.integerInRange(50, game.width - 100);
            var y = isPlayer ? (game.height / 2) : game.rnd.integerInRange(50, game.height - 100);
            thing.setPosition(x, y);
            var scale = isPlayer ? 0.1 : game.rnd.realInRange(0.025, 0.2);
            thing.setScale(scale);
            thing.setController(isPlayer ? new CursorController(this.game.input.keyboard.createCursorKeys()) : new AIController(this.game.rnd));
            this.things.push(thing);
        }
    };
    RunState.prototype.update = function () {
        if (this.things.length > 0) {
            for (var _i = 0, _a = this.things; _i < _a.length; _i++) {
                var thing = _a[_i];
                thing.update();
            }
        }
    };
    RunState.prototype.render = function () {
    };
    return RunState;
}(Phaser.State));
;
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        _super.call(this, 800, 600, Phaser.AUTO, 'game');
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