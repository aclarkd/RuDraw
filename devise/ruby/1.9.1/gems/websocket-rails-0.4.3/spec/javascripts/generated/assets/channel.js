
/*
The channel object is returned when you subscribe to a channel.

For instance:
  var dispatcher = new WebSocketRails('localhost:3000/websocket');
  var awesome_channel = dispatcher.subscribe('awesome_channel');
  awesome_channel.bind('event', function(data) { console.log('channel event!'); });
  awesome_channel.trigger('awesome_event', awesome_object);
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  WebSocketRails.Channel = (function() {

    function Channel(name, _dispatcher, is_private) {
      var event, event_name;
      this.name = name;
      this._dispatcher = _dispatcher;
      this.is_private = is_private;
      this._failure_launcher = __bind(this._failure_launcher, this);

      this._success_launcher = __bind(this._success_launcher, this);

      this.dispatch = __bind(this.dispatch, this);

      this.trigger = __bind(this.trigger, this);

      this.bind = __bind(this.bind, this);

      if (this.is_private) {
        event_name = 'websocket_rails.subscribe_private';
      } else {
        event_name = 'websocket_rails.subscribe';
      }
      event = new WebSocketRails.Event([
        event_name, {
          data: {
            channel: this.name
          }
        }, this._dispatcher.connection_id
      ], this._success_launcher, this._failure_launcher);
      this._dispatcher.trigger_event(event);
      this._callbacks = {};
    }

    Channel.prototype.bind = function(event_name, callback) {
      var _base, _ref;
      if ((_ref = (_base = this._callbacks)[event_name]) == null) {
        _base[event_name] = [];
      }
      return this._callbacks[event_name].push(callback);
    };

    Channel.prototype.trigger = function(event_name, message) {
      var event;
      event = new WebSocketRails.Event([
        event_name, {
          channel: this.name,
          data: message
        }, this._dispatcher.connection_id
      ]);
      return this._dispatcher.trigger_event(event);
    };

    Channel.prototype.dispatch = function(event_name, message) {
      var callback, _i, _len, _ref, _results;
      if (this._callbacks[event_name] == null) {
        return;
      }
      _ref = this._callbacks[event_name];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback(message));
      }
      return _results;
    };

    Channel.prototype._success_launcher = function(data) {
      if (this.on_success != null) {
        return this.on_success(data);
      }
    };

    Channel.prototype._failure_launcher = function(data) {
      if (this.on_failure != null) {
        return this.on_failure(data);
      }
    };

    return Channel;

  })();

}).call(this);
