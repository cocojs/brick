var layers = {};
var GameScene = cc.Scene.extend({
	onEnter : function(){
		this._super();
		var bg = new cc.Sprite(res.bg);
		bg.attr({
			anchorX : 0.5,
			anchorY : 0.5,
			x : cc.winSize.width/2,
			y : cc.winSize.height/2
		});
		this.addChild(bg);

		layers.game = new PongLayer();
		this.addChild(layers.game);

		layers.startUI = new StartUI();
		this.addChild(layers.startUI);

	}
});

var StartUI = cc.Layer.extend({

	ctor : function(){

		this._super();
		var start = new cc.Sprite(res.start);
		start.x = cc.winSize.width/2;
		start.y = cc.winSize.height/2 + 20;
		this.addChild(start);

	},
	onEnter : function(){
		this._super();
		cc.eventManager.addListener({
			event:cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesEnded : function(touches, event){
				var touch = touches[0];
				console.log(touch);
				var pos = touch.getLocation();
				if(pos.y < cc.winSize.height/3){
					layers.game.init();
					layers.startUI.removeFromParent();
				}
			}
		},this);
	},	
});

var GameLayer = cc.Layer.extend({
	ctor:function(){
		this._super();
	},

	initGame:function(){
		var glayer = new cc.Sprite(res.succeed);
		glayer.x = cc.winSize.width/2;
		glayer.y = cc.winSize.height/2;
		this.addChild(glayer);	
	},

});
