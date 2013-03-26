
/*
The Event object stores all the relevant event information.
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  WebSocketRails.Event = (function() {

    function Event(data, success_callback, failure_callback) {
      var attr;
      this.success_callback = success_callback;
      this.failure_callback = failure_callback;
      this.run_callbacks = __bind(this.run_callbacks, this);

      this.attributes = __bind(this.attributes, this);

      this.serialize = __bind(this.serialize, this);

      this.is_ping = __bind(this.is_ping, this);

      this.is_result = __bind(this.is_result, this);

      this.is_channel = __bind(this.is_channel, this);

      this.name = data[0];
      attr = data[1];
      if (attr != null) {
        this.id = attr['id'] != null ? attr['id'] : ((1 + Math.random()) * 0x10000) | 0;
        this.channel = attr.channel != null ? attr.channel : void 0;
        this.data = attr.data != null ? attr.data : attr;
        this.connection_id = data[2];
        if (attr.success != null) {
          this.result = true;
          this.success = attr.success;
        }
      }
    }

    Event.prototype.is_channel = function() {
      return this.channel != null;
    };

    Event.prototype.is_result = function() {
      return this.result === true;
    };

    Event.prototype.is_ping = function() {
      return this.name === 'websocket_rails.ping';
    };

    Event.prototype.serialize = function() {
      return JSON.stringify([this.name, this.attributes()]);
    };

    Event.prototype.attributes = function() {
      return {
        id: this.id,
        channel: this.channel,
        data: this.data
      };
    };

    Event.prototype.run_callbacks = function(success, data) {
      if (success === true) {
        return typeof this.success_callback === "function" ? this.success_callback(data) : void 0;
      } else {
        return typeof this.failure_callback === "function" ? this.failure_callback(data) : void 0;
      }
    };

    return Event;

  })();

}).call(this);
