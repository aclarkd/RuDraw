
/*
 HTTP Interface for the WebSocketRails client.
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  WebSocketRails.HttpConnection = (function() {

    HttpConnection.prototype.httpFactories = function() {
      return [
        function() {
          return new XMLHttpRequest();
        }, function() {
          return new ActiveXObject("Msxml2.XMLHTTP");
        }, function() {
          return new ActiveXObject("Msxml3.XMLHTTP");
        }, function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }
      ];
    };

    HttpConnection.prototype.createXMLHttpObject = function() {
      var factories, factory, xmlhttp, _i, _len;
      xmlhttp = false;
      factories = this.httpFactories();
      for (_i = 0, _len = factories.length; _i < _len; _i++) {
        factory = factories[_i];
        try {
          xmlhttp = factory();
        } catch (e) {
          continue;
        }
        break;
      }
      return xmlhttp;
    };

    function HttpConnection(url, dispatcher) {
      this.url = url;
      this.dispatcher = dispatcher;
      this.flush_queue = __bind(this.flush_queue, this);

      this.trigger = __bind(this.trigger, this);

      this.parse_stream = __bind(this.parse_stream, this);

      this.createXMLHttpObject = __bind(this.createXMLHttpObject, this);

      this._conn = this.createXMLHttpObject();
      this.last_pos = 0;
      this.message_queue = [];
      this._conn.onreadystatechange = this.parse_stream;
      this._conn.open("GET", "/websocket", true);
      this._conn.send();
    }

    HttpConnection.prototype.parse_stream = function() {
      var data, decoded_data;
      if (this._conn.readyState === 3) {
        data = this._conn.responseText.substring(this.last_pos);
        this.last_pos = this._conn.responseText.length;
        data = data.replace(/\]\]\[\[/g, "],[");
        decoded_data = JSON.parse(data);
        return this.dispatcher.new_message(decoded_data);
      }
    };

    HttpConnection.prototype.trigger = function(event) {
      if (this.dispatcher.state !== 'connected') {
        return this.message_queue.push(event);
      } else {
        return this.post_data(this.dispatcher.connection_id, event.serialize());
      }
    };

    HttpConnection.prototype.post_data = function(connection_id, payload) {
      return $.ajax("/websocket", {
        type: 'POST',
        data: {
          client_id: connection_id,
          data: payload
        },
        success: function() {}
      });
    };

    HttpConnection.prototype.flush_queue = function(connection_id) {
      var event, _i, _len, _ref;
      _ref = this.message_queue;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        if (connection_id != null) {
          event.connection_id = this.dispatcher.connection_id;
        }
        this.trigger(event);
      }
      return this.message_queue = [];
    };

    return HttpConnection;

  })();

}).call(this);
