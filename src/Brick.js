/**
 * Created by czhang on 2014/9/28.
 */

var Brick = cc.Sprite.extend({

initWithColor:function (size) {
	
    var color = new Color();
    var rgb = cc.color(255,0,0,0);
    color._setWidth(50);
    color._setHeight(50);
    color.setColor(rgb);
    this.addChild(color);
    return true;
}
});

var Color = cc.LayerColor.extend({
	
});

Brick.brickWithColor = function (size) {
    var brick = new Brick();
    brick.initWithColor(size);
    return brick;
};