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
        //paddle = paddle.convertToNodeSpace(paddle.getPosition());
    	paddle = paddle.getPosition();
/*        cc.log("paddleY : " + paddle.y);
        cc.log("paddleX : " + paddle.x);  */       
        
        
        paddleRect.x = paddleRect.x + paddle.x - (paddleRect.width/2.0);
        paddleRect.y = paddleRect.y + paddle.y - (paddleRect.height/2.0);
        
/*        cc.log("pdRectx : " + paddleRect.x);
        cc.log("pdRecty : " + paddleRect.y);
        cc.log("pdRecth : " + paddleRect.height);
        cc.log("pdRectw : " + paddleRect.width);
        cc.log("pdx : " + paddle.x);
        cc.log("pdy : " + paddle.y);
        cc.log("thisx : " + this.x);
        cc.log("thisy : " + this.y);  
        cc.log("thisredius : " + this.radius());*/
        
        var lowY = cc.rectGetMinY(paddleRect);
        var midY = cc.rectGetMidY(paddleRect);
        var highY = cc.rectGetMaxY(paddleRect);

        var leftX = cc.rectGetMinX(paddleRect);
        var rightX = cc.rectGetMaxX(paddleRect);

/*        cc.log("thisx : " + this.x);
        cc.log("thisy : " + this.y);*/
/*        cc.log("lowY : " + lowY);
        cc.log("midY : " + midY);  */
/*        cc.log("leftX : " + cc.rectGetMinX(paddleRect));
        cc.log("rightX : " + cc.rectGetMaxX(paddleRect));*/

        if ((this.x + this.radius() > leftX) && (this.x - this.radius() < rightX)) {
/*            cc.log("leftX : " + cc.rectGetMinX(paddleRect));
            cc.log("rightX : " + cc.rectGetMaxX(paddleRect));*/
        	//cc.log("ht");
        	//cc.log("highy : " + (highY + this.radius()));
            var hit = false;
            var angleOffset = 0.0;
            if ((this.y > midY) && (this.y <= (highY + this.radius()))) {
            	//cc.log("highy : " + (highY + this.radius()));
            	//cc.log("ht");
            	//cc.log("ht");
                this.y = highY + this.radius();
                hit = true;
                angleOffset = Math.PI / 2;
            } else if (this.y < midY && this.y >= lowY - this.radius()) {
/*            	cc.log("lowY : " + (lowY - this.radius()));
            	cc.log("ht");*/
            	//cc.log("ht");
                this.y = lowY - this.radius();
                hit = true;
                angleOffset = -Math.PI / 2;
            }

            if (hit) {
            	
                var hitAngle = cc.pToAngle(cc.p(paddle.x - this.x, paddle.y - this.y)) + angleOffset;

                var scalarVelocity = cc.pLength(this._velocity) * 1.00000005;
                var velocityAngle = -cc.pToAngle(this._velocity) + 0.00000005 * hitAngle;
                //this._velocity = -this._velocity.y;
                this._velocity = cc.pMult(cc.pForAngle(velocityAngle), scalarVelocity);
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
