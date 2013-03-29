if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

var draw = {
    draw : null,
    context : null,
    canvas : null,
    fillColor : '#000000',
    mouseDown : false,
    lineX : [], // X,Y points in current line
    lineY : [],
    lines : 0, // number of lines drawn
    co : 7, // cursor offset
    dispatcher : null,

    startDrawing: function (c, d) {
        draw = this,
        draw.canvas = c;
        draw.dispatcher = d;
        draw.context = draw.canvas[0].getContext("2d");
        draw.canvas.mousedown(this.__onMouseDown);
        draw.canvas[0].addEventListener('mousemove', this.__onMouseMove, false);
        draw.canvas[0].addEventListener('mouseup', this.__onMouseUp, false);
        draw.canvas[0].addEventListener('mouseleave', this.__onMouseLeave, false);

        this.bindDispatcherEvents();
    },

    bindDispatcherEvents: function (){
        dispatcher.bind('recieve_coordinates', function(data) {
            var xy = data.message;
            draw.drawLine(draw.context, xy.x, xy.x1, xy.y, xy.y1);
        });

   //     dispatcher.bind('recieve_clear', function(data) {
   //         draw.clear();
   //     });
    },

    __onMouseDown: function (e) {
		draw.mouseDown = true;
		draw.lineX.push(e.offsetX-draw.cursorOffset);
		draw.lineY.push(e.offsetY-draw.cursorOffset);
    },

    __onMouseUp: function (e) {
        draw.lineX = [];
        draw.lineY = [];
        draw.mouseDown = false;
    },

    __onMouseMove: function (e) {
	if(draw.mouseDown){
            x = e.x-draw.co;
            y = e.y-draw.co;

            draw.lines++;
            if(draw.lineX.length > 1){
                x1 = draw.lineX.last();
                y1 = draw.lineY.last();
                draw.drawLine(draw.context, x, x1, y, y1);
                var message = { x:x, x1:x1, y:y, y1:y1 };
                draw.dispatcher.trigger('broadcast_coordinates', message);
            }

            draw.lineX.push(x);
            draw.lineY.push(y);
        }
    },

    broadcastClear: function(){
     //   var message = { x:x, x1:x1, y:y, y1:y1 };
     //   draw.dispatcher.trigger('broadcast_coordinates', message);
    },

    clear: function(){
     //   draw.context.clearRect(x, y, w, h);
    },

    __onMouseLeave: function(){
        alert('test');
    },

    drawLine: function(context, x,x1,y,y1) {
        context.moveTo(x, y);
        context.lineTo(x1,y1);
        context.stroke();
    }
};
