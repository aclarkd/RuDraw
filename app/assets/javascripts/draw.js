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
    channel : null,
    connectionId: null,
    presenter: false,

    startDrawing: function (c, d) {
        draw = this,
        draw.canvas = c[0];
        draw.channel = d;
        draw.context = c[0].getContext("2d");

        // attach event listeners
        draw.canvas.addEventListener('mousedown', this.__onMouseDown, false);
        draw.canvas.addEventListener('mousemove', this.__onMouseMove, false);
        draw.canvas.addEventListener('mouseup', this.__onMouseUp, false);
        draw.canvas.addEventListener('mouseleave', this.__onMouseLeave, false);

        draw.canvas.onselectstart = function () { return false; } // disable i-beam cursor on drag

        this.bindChannelEvents();
    },

    bindChannelEvents: function (){
        // connection management
        draw.channel.on_open = function(data) {
            draw.channel.trigger('register_connection', data);
        }

        draw.channel.bind('client_connected', function(data) {
            draw.connectionId = data.connection_id;
        });

        // canvas controls
        draw.channel.bind('receive_coordinates', function(data) {
            var xy = data.message;
            draw.drawLine(draw.context, xy.x, xy.x1, xy.y, xy.y1);
        });

        draw.channel.bind('receive_clear', function(data) {
            draw.clearCanvas();
        });

        // game state controls
        draw.channel.bind('receive_presenter', function(data) {
            draw.acceptPresenter(data.presenter_id);
        });

        draw.channel.bind('test', function(data) {
            console.log(data.message, draw.presenter);
        });
    },

    acceptPresenter: function(presenter_id){
        var message = { connection_id : presenter_id };
        draw.channel.trigger('accept_presenter', message); // accept the presenter role
        if(presenter_id == draw.connectionId){
            draw.presenter = true;
        }
        console.log('presenter ', presenter_id);
    },

    test: function(){
        var message = {};
        draw.channel.trigger('test', message); // clear all canvases
        console.log('me', draw.connectionId);
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
                x1 = draw.lineX[draw.lineX.length-1];
                y1 = draw.lineY[draw.lineY.length-1];
                draw.drawLine(draw.context, x, x1, y, y1);
                var message = { x:x, x1:x1, y:y, y1:y1 };
                draw.channel.trigger('broadcast_coordinates', message); // send new line to server
            }

            draw.lineX.push(x);
            draw.lineY.push(y);
        }
    },

    clear: function(){
        var message = {};
        draw.channel.trigger('broadcast_clear_canvas', message); // clear all canvases
    },

    clearCanvas: function(){
        draw.context.save();
        draw.context.setTransform(1, 0, 0, 1, 0, 0);
        draw.context.clearRect(0, 0, draw.canvas.width, draw.canvas.height);
        draw.context.beginPath();
        draw.context.restore();
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
