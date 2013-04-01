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
    time: 0,
    clock: null,

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
        draw.channel.bind('client_connected', function(data) {
            draw.connectionId = data.connection_id;
        });

        draw.channel.bind('client_disconnected', function(data) {
            console.log('someone left', data);
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
            draw.acceptPresenter(); // send acceptance message
        });

        draw.channel.bind('receive_time', function(data) {
            console.log('start timer')
            draw.time = data.time;
            draw.clock = setInterval(draw.checkTime, 1000);
        });

        draw.channel.bind('receive_item_to_draw', function(data) {
            draw.presenter = true;
            console.log('item', data.item);
        });

        draw.channel.bind('test', function(data) {
            console.log(data, draw.connectionId);
        });
    },

    checkTime: function(){
        draw.time--;
        console.log(draw.time);
        if(draw.time == 0){
            console.log('times up');
            clearInterval(draw.clock);
        }
    },

    acceptPresenter: function(){
        draw.presenter = false;
        var message = { connection_id : draw.connectionId };
        draw.channel.trigger('accept_presenter', message); // accept the presenter role
    },

    disconnect: function(){
        var message = { connection_id : draw.connectionId };
        draw.channel.trigger('client_disconnected', message);
    },

    test: function(){
        var message = { connection_id : draw.connectionId };
        draw.channel.trigger('test', message); // clear all canvases
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
                var message = { connection_id : draw.connectionId, x:x, x1:x1, y:y, y1:y1 };
                draw.channel.trigger('broadcast_coordinates', message); // send new line to server
            }

            draw.lineX.push(x);
            draw.lineY.push(y);
        }
    },

    clear: function(){
        var message = { connection_id : draw.connectionId };
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
