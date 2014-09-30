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
var Ball = cc.Sprite.extend({
    _velocity:cc.p(0,0),
    _radius:0,
    radius:function () {
        return this._radius;
    },
    setRadius:function (rad) {
        this._radius = rad;
    },

    move:function (delta) {
        //cc.log("delta:  " + delta);
	    this.x += this._velocity.x * delta;
	    this.y += this._velocity.y * delta;
        var winSize = cc.director.getWinSize();
        if (this.x > winSize.width - this.radius()) {
            this.x = winSize.width - this.radius();
            this._velocity.x *= -1;
        } else if (this.x < this.radius()) {
            this.x = this.radius();
            this._velocity.x *= -1;
        }
    },
    collideWithPaddle:function (paddle) {
    	var paddleRect = paddle.getTextureRect();

    	paddle = paddle.getPosition();

        paddleRect.x = paddleRect.x + paddle.x - (paddleRect.width/2.0);
        paddleRect.y = paddleRect.y + paddle.y - (paddleRect.height/2.0);

        var lowY = cc.rectGetMinY(paddleRect);
        var midY = cc.rectGetMidY(paddleRect);
        var highY = cc.rectGetMaxY(paddleRect);

        var leftX = cc.rectGetMinX(paddleRect);
        var rightX = cc.rectGetMaxX(paddleRect);

        this.collide(lowY,midY,highY,leftX,rightX,paddle);
    },

    collideWithBrick:function(brick,size){
    	if(!brick)
    		return false;
    	
        var brickpos = brick.getPosition();
        var bheight = size.height/20.0;
        var bwidth = size.width/11.0;

        var lowY = brickpos.y - (bheight/2.0);
        var midY = brickpos.y;
        var highY = brickpos.y + (bheight/2.0);

        var leftX =  brickpos.x - (bwidth/2.0);
        var rightX =  brickpos.x + (bwidth/2.0);

        if(this.collide(lowY,midY,highY,leftX,rightX,brickpos))
        {
            //PongLayer._bricks.remove(flag);
            //PongLayer.removeChild(brick);
        	return true;
        }
    },

    collide:function(lowY,midY,highY,leftX,rightX,objpos){
    	if ((this.x + this.radius() > leftX) && (this.x - this.radius() < rightX)) {
    		var hit = false;
    		var angleOffset = 0.0;
    		if ((this.y > midY) && (this.y <= (highY + this.radius()))) {
    			this.y = highY + this.radius();
    			hit = true;
    			angleOffset = Math.PI / 2;
    		} else if (this.y < midY && this.y >= lowY - this.radius()) {
    			this.y = lowY - this.radius();
    			hit = true;
    			angleOffset = -Math.PI / 2;
    		}

    		if (hit) {
    			var hitAngle = cc.pToAngle(cc.p(objpos.x - this.x, objpos.y - this.y)) + angleOffset;
    			var scalarVelocity = cc.pLength(this._velocity) * 1.00000005;
    			var velocityAngle = -cc.pToAngle(this._velocity) + 0.00000005 * hitAngle;
    			//this._velocity = -this._velocity.y;
    			this._velocity = cc.pMult(cc.pForAngle(velocityAngle), scalarVelocity);
                return true;
    		}
    	}
    },
    
    setVelocity:function (velocity) {
        this._velocity = velocity;
    },
    getVelocity:function () {
        return this._velocity;
    }
});

Ball.ballWithTexture = function (texture) {
    var ball = new Ball();
    var size = texture.getContentSize();
    //cc.log("size:" + size.width);
    ball.initWithTexture(texture);
    if (texture instanceof cc.Texture2D)
        ball.setRadius(size.width / 2);
    else if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement))
    	ball.setRadius(size.width / 2);
    return ball;
};
