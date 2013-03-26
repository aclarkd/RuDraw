
/*
WebsocketRails JavaScript Client

Setting up the dispatcher:
  var dispatcher = new WebSocketRails('localhost:3000');
  dispatcher.on_open = function() {
    // trigger a server event immediately after opening connection
    dispatcher.trigger('new_user',{user_name: 'guest'});
  })

Triggering a new event on the server
  dispatcherer.trigger('event_name',object_to_be_serialized_to_json);

Listening for new events from the server
  dispatcher.bind('event_name', function(data) {
    console.log(data.user_name);
  });
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.WebSocketRails = (function() {

    function WebSocketRails(url, use_websockets) {
      this.url = url;
      this.use_websockets = use_websockets != null ? use_websockets : true;
      this.pong = __bind(this.pong, this);

      this.supports_websockets = __bind(this.supports_websockets, this);

      this.dispatch_channel = __bind(this.dispatch_channel, this);

      this.subscribe_private = __bind(this.subscribe_private, this);

      this.subscribe = __bind(this.subscribe, this);

      this.dispatch = __bind(this.dispatch, this);

      this.trigger_event = __bind(this.trigger_event, this);

      this.trigger = __bind(this.trigger, this);

      this.bind = __bind(this.bind, this);

      this.connection_established = __bind(this.connection_established, this);

      this.new_message = __bind(this.new_message, this);

      this.state = 'connecting';
      this.callbacks = {};
      this.channels = {};
      this.queue = {};
      if (!(this.supports_websockets() && this.use_websockets)) {
        this._conn = new WebSocketRails.HttpConnection(url, this);
      } else {
        this._conn = new WebSocketRails.WebSocketConnection(url, this);
      }
      this._conn.new_message = this.new_message;
    }

    WebSocketRails.prototype.new_message = function(data) {
      var event, socket_message, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        socket_message = data[_i];
        event = new WebSocketRails.Event(socket_message);
        if (event.is_result()) {
          if ((_ref = this.queue[event.id]) != null) {
            _ref.run_callbacks(event.success, event.data);
          }
          this.queue[event.id] = null;
        } else if (event.is_channel()) {
          this.dispatch_channel(event);
        } else if (event.is_ping()) {
          this.pong();
        } else {
          this.dispatch(event);
        }
        if (this.state === 'connecting' && event.name === 'client_connected') {
          _results.push(this.connection_established(event.data));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    WebSocketRails.prototype.connection_established = function(data) {
      this.state = 'connected';
      this.connection_id = data.connection_id;
      this._conn.flush_queue(data.connection_id);
      if (this.on_open != null) {
        return this.on_open(data);
      }
    };

    WebSocketRails.prototype.bind = function(event_name, callback) {
      var _base, _ref;
      if ((_ref = (_base = this.callbacks)[event_name]) == null) {
        _base[event_name] = [];
      }
      return this.callbacks[event_name].push(callback);
    };

    WebSocketRails.prototype.trigger = function(event_name, data, success_callback, failure_callback) {
      var event;
      event = new WebSocketRails.Event([event_name, data, this.connection_id], success_callback, failure_callback);
      this.queue[event.id] = event;
      return this._conn.trigger(event);
    };

    WebSocketRails.prototype.trigger_event = function(event) {
      var _base, _name, _ref;
      if ((_ref = (_base = this.queue)[_name = event.id]) == null) {
        _base[_name] = event;
      }
      return this._conn.trigger(event);
    };

    WebSocketRails.prototype.dispatch = function(event) {
      var callback, _i, _len, _ref, _results;
      if (this.callbacks[event.name] == null) {
        return;
      }
      _ref = this.callbacks[event.name];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback(event.data));
      }
      return _results;
    };

    WebSocketRails.prototype.subscribe = function(channel_name) {
      var channel;
      if (this.channels[channel_name] == null) {
        channel = new WebSocketRails.Channel(channel_name, this);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return this.channels[channel_name];
      }
    };

    WebSocketRails.prototype.subscribe_private = function(channel_name) {
      var channel;
      if (this.channels[channel_name] == null) {
        channel = new WebSocketRails.Channel(channel_name, this, true);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return this.channels[channel_name];
      }
    };

    WebSocketRails.prototype.dispatch_channel = function(event) {
      if (this.channels[event.channel] == null) {
        return;
      }
      return this.channels[event.channel].dispatch(event.name, event.data);
    };

    WebSocketRails.prototype.supports_websockets = function() {
      return typeof WebSocket === "function" || typeof WebSocket === "object";
    };

    WebSocketRails.prototype.pong = function() {
      var pong;
      pong = new WebSocketRails.Event(['websocket_rails.pong', {}, this.connection_id]);
      return this._conn.trigger(pong);
    };

    return WebSocketRails;

  })();

}).call(this);
