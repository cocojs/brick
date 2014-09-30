/**
 * Created by czhang on 2014/9/28.
 */

var Brick = cc.Sprite.extend({

initWithColor:function (size) {
    var color = new Color();
    var rgb = cc.color(255,0,0,0);
    var height = size.height/20.0;
    var width = size.width/11.0;
    color._setWidth(width);
    color._setHeight(height);
    color.setColor(rgb);
    this.addChild(color);
    return true;
},
ctor: function(){
	this._super();
}
});

var Color = cc.LayerColor.extend({
	
});

Brick.brickWithColor = function (size) {
    var brick = new Brick();
    brick.initWithColor(size);
    return brick;
};