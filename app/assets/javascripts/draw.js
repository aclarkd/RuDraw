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
    interface: null, // interface observable
    presenter: false, // ensure players cannot perform presenter actions, socket controller will verify for as well for security
    time: 0,
    clock: null,
    scores: [],

    startDrawing: function (c, d, interface) {
        draw = this,
        draw.canvas = c[0];
        draw.channel = d;
        draw.interface = interface; // interface update events triggered on this observable
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

        });

        // canvas controls
        draw.channel.bind('receive_coordinates', function(data) {
            var xy = data.message;
            draw.drawLine(draw.context, xy.x, xy.x1, xy.y, xy.y1);
        });

        draw.channel.bind('receive_clear', function() {
            draw.clearCanvas();
        });

        // game state controls
        draw.channel.bind('receive_presenter', function(data) {
            clearInterval(draw.clock);
            draw.interface.trigger('player'); // set all connected players to player interface
            draw.presenter = false;
            var message = { connection_id : draw.connectionId };
            draw.channel.trigger('accept_presenter', message); // send acceptance message
        });

        draw.channel.bind('receive_time', function(data) {
            draw.time = data.time;
            draw.clock = setInterval(draw.checkTime, 1000);
        });

        draw.channel.bind('receive_score', function(data) {
/*            if (typeof draw.scores[data.connection_id + " - "] != 'undefined') {
                draw.scores[data.connection_id + " - "] += data.score;
            } else {
                draw.scores[data.connection_id + " - "] = data.score;
            }
            draw.interface.trigger('update_scores', { scores: draw.scores });*/
        });

        draw.channel.bind('receive_item_to_draw', function(data) {
            draw.interface.trigger('presenter', data.item);
            draw.presenter = true;
        });

        draw.channel.bind('receive_guess', function(data) {
            draw.interface.trigger('guess', { user: data.user, guess: data.guess, correct: data.correct });
        });
    },

    guess: function(guess){
        var message = { guess: guess, connection_id: draw.connectionId }
        draw.channel.trigger('guess', message);
        draw.interface.trigger('clear_guess');
    },

    checkTime: function(){
        draw.time--;
        draw.interface.trigger('update_time', draw.time);
        if(draw.time <= 0){
            clearInterval(draw.clock);
            if(draw.presenter){
                var message = { connection_id : draw.connectionId };
                draw.channel.trigger('timer_expired', message);
            }
        }
    },

    disconnect: function(){
        var message = { connection_id : draw.connectionId };
        draw.channel.trigger('client_disconnected', message);
    },

    test: function(){
        var message = { connection_id : draw.connectionId };
        draw.channel.trigger('test', message); // clear all canvases
    },

    getCursorPosition: function(e) {
        var x;
        var y;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        x -= draw.canvas.offsetLeft;
        y -= draw.canvas.offsetTop;

        return { x:x, y:y }
    },

    __onMouseDown: function (e) {
        if(!draw.presenter){
            draw.interface.trigger('guess_reminder');
            return;
        }
        draw.mouseDown = true;
        p = draw.getCursorPosition(e);
        draw.lineX.push(p.x);
        draw.lineY.push(p.y);
    },

    __onMouseUp: function (e) {
        draw.lineX = [];
        draw.lineY = [];
        draw.mouseDown = false;
    },

    __onMouseMove: function (e) {
        if(draw.mouseDown && draw.presenter){
            p = draw.getCursorPosition(e);
            draw.lines++;
            if(draw.lineX.length > 1){
                x1 = draw.lineX[draw.lineX.length-1];
                y1 = draw.lineY[draw.lineY.length-1];
                draw.drawLine(draw.context, p.x, x1, p.y, y1);
                var message = { connection_id : draw.connectionId, x: p.x, x1:x1, y: p.y, y1:y1 };
                draw.channel.trigger('broadcast_coordinates', message); // send new line to server
            }

            draw.lineX.push(p.x);
            draw.lineY.push(p.y);
        }
    },

    // sends messages to all canvases to clear themselves
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
