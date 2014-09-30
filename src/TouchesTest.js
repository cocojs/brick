/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var HIGH_PLAYER = 0;
var LOW_PLAYER = 1;
var STATUS_BAR_HEIGHT = 20.0;
var SPRITE_TAG = 0;

Array.prototype.remove=function(d,arr){
	return arr.slice(0,d-1).concat(arr.slice(d));
};

/*Array.prototype.remove=function(dx)
{
	if(isNaN(dx)||dx>this.length){return false;}
	for(var i=0,n=0;i<this.length;i++)
	{
		if(this[i]!=this[dx])
		{
			this[n++]=this[i];
		}
	}
	this.length-=1;
}*/


/*Array.prototype.remove=function(n) {
	//n表示第几项，从0开始算起。
	//prototype为对象原型，注意这里为对象增加自定义方法的方法。
	if(n<0)//如果n<0，则不进行任何操作。
		return this;
	else
		return this.slice(0,n).concat(this.slice(n+1,this.length));
	
	　　　concat方法：返回一个新数组，这个新数组是由两个或更多数组组合而成的。
	　　　　　　　　　这里就是返回this.slice(0,n)/this.slice(n+1,this.length)
	　　 　　　　　　组成的新数组，这中间，刚好少了第n项。
	　　　slice方法： 返回一个数组的一段，两个参数，分别指定开始和结束的位置。
	 
}
*/
var TouchesTestScene = cc.Scene.extend({
    ctor:function () {
        this._super(true);
        var pongLayer = new PongLayer();
        this.addChild(pongLayer);
    },
    runThisTest:function () {
        cc.director.runScene(this);
    },
    MainMenuCallback:function (sender) {
        this._super(sender);
    }
});


var PongLayer = cc.Layer.extend({
    _ball:null,
    _paddles:[],
    _bricks:[],
    _ballStartingVelocity:null,
    _paddle_Ai:null,
    _winSize:null,

    ctor:function () {
        this._super();
        this._ballStartingVelocity = cc.p(200.0, -1000.0);
        this._winSize = cc.director.getWinSize();
        
        this._ball = Ball.ballWithTexture(cc.textureCache.addImage(res.s_ball));
        this._ball.x = this._winSize.width / 2;
        this._ball.y = this._winSize.height / 2 -30;
        this._ball.setVelocity(this._ballStartingVelocity);
        this.addChild(this._ball);

        var paddleTexture = cc.textureCache.addImage(res.s_paddle);

        this._paddles = [];

        var paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.x = this._winSize.width / 2;
        paddle.y = 15;
        this._paddles.push(paddle);

        paddle = Paddle.paddleWithTexture(paddleTexture);
        paddle.x = this._winSize.width / 2;
        paddle.y = 100;
        this._paddles.push(paddle);

        var paddle_Ai = Paddle.paddleWithTexture(paddleTexture);
        paddle_Ai.x = this._winSize.width / 2;
        paddle_Ai.y = this._winSize.height - 10;
        this._paddle_Ai = paddle_Ai;
        this.addChild(this._paddle_Ai);

        for (var i = 0; i < this._paddles.length; i++) {
            if (!this._paddles[i])
                break;

            this.addChild(this._paddles[i]);
        }

        /*
            brick大小
              1/11 * 10
            空挡大小
              1/121 * 11
              1/11 * 10 + 1/121 * 11 = 1
        */

        for(var j = 0 ; j < 10 ; j++){
        	var brick = Brick.brickWithColor(this._winSize);
            brick.x = (this._winSize.width / 121 * (j + 1)) + (this._winSize.width / 11 * j);
            brick.y = this._winSize.height / 2;
            this._bricks.push(brick);
            this.addChild(brick);
        }
        this.schedule(this.doStep);
    },

    resetAndScoreBallForPlayer:function (player) {
        if (Math.abs(this._ball.getVelocity().y) < 300) {
            this._ballStartingVelocity = cc.pMult(this._ballStartingVelocity, -1.1);
        } else {
            this._ballStartingVelocity = cc.pMult(this._ballStartingVelocity, -1);
        }
        this._ball.setVelocity(this._ballStartingVelocity);
        this._ball.x = this._winSize.width / 2;
        this._ball.y = this._winSize.height / 2;
        this._paddle_Ai.x = this._winSize.width / 2;
        this._paddle_Ai.y = this._winSize.height - 10 ;
    },

    
    doStep:function (delta) {
        this._ball.move(delta);
        this._paddle_Ai.move(delta,this._ball);

        for (var i = 0; i < this._paddles.length; i++) {
            if (!this._paddles[i])
                break;
            this._ball.collideWithPaddle(this._paddles[i]);
        }
        var flag = null;
        for(var j = 0; j < this._bricks.length; j++) {
        	
            if(!this._bricks[j])
                break;
            if(this._ball.collideWithBrick(this._bricks[j] , this._winSize))
            {
            	flag = j;
            	//cc.log("j" + j);
                //this._bricks.splice(j,1);
                //this.removeChild(this._bricks[j]);
            }
        }
        if(flag)
        {
        	//cc.log(flag);
        	this._bricks.remove(flag,this._bricks);
            this.removeChild(this._bricks[flag],true);
        }

        this._ball.collideWithPaddle(this._paddle_Ai);
        if (this._ball.y < -this._ball.radius())
        {
            this.resetAndScoreBallForPlayer(HIGH_PLAYER);
        }
        this._ball.draw();
        this._paddle_Ai.draw();
    }
});

