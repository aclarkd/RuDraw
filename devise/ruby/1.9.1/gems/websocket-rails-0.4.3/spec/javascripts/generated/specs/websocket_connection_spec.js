(function() {

  describe('WebsocketRails.WebSocketConnection:', function() {
    beforeEach(function() {
      var dispatcher;
      dispatcher = {
        new_message: function() {
          return true;
        },
        dispatch: function() {
          return true;
        },
        state: 'connected'
      };
      window.WebSocket = function(url) {
        this.url = url;
        return this.send = function() {
          return true;
        };
      };
      return this.connection = new WebSocketRails.WebSocketConnection('localhost:3000/websocket', dispatcher);
    });
    describe('constructor', function() {
      it('should set the onmessage event on the WebSocket object to this.on_message', function() {
        return expect(this.connection._conn.onmessage).toEqual(this.connection.on_message);
      });
      it('should set the onclose event on the WebSocket object to this.on_close', function() {
        return expect(this.connection._conn.onclose).toEqual(this.connection.on_close);
      });
      describe('with ssl', function() {
        return it('should not add the ws:// prefix to the URL', function() {
          var connection;
          connection = new WebSocketRails.WebSocketConnection('wss://localhost.com');
          return expect(connection.url).toEqual('wss://localhost.com');
        });
      });
      return describe('without ssl', function() {
        return it('should add the ws:// prefix to the URL', function() {
          return expect(this.connection.url).toEqual('ws://localhost:3000/websocket');
        });
      });
    });
    describe('.trigger', function() {
      describe('before the connection has been fully established', function() {
        return it('should queue up the events', function() {
          var event, mock_queue;
          this.connection.dispatcher.state = 'connecting';
          event = new WebSocketRails.Event(['event', 'message']);
          mock_queue = sinon.mock(this.connection.message_queue);
          return mock_queue.expects('push').once().withArgs(event);
        });
      });
      return describe('after the connection has been fully established', function() {
        return it('should encode the data and send it through the WebSocket object', function() {
          var event, mock_connection;
          this.connection.dispatcher.state = 'connected';
          event = new WebSocketRails.Event(['event', 'message']);
          this.connection._conn = {
            send: function() {
              return true;
            }
          };
          mock_connection = sinon.mock(this.connection._conn);
          mock_connection.expects('send').once().withArgs(event.serialize());
          this.connection.trigger(event);
          return mock_connection.verify();
        });
      });
    });
    describe('.on_message', function() {
      return it('should decode the message and pass it to the dispatcher', function() {
        var encoded_data, event, mock_dispatcher;
        encoded_data = JSON.stringify(['event', 'message']);
        event = {
          data: encoded_data
        };
        mock_dispatcher = sinon.mock(this.connection.dispatcher);
        mock_dispatcher.expects('new_message').once().withArgs(JSON.parse(encoded_data));
        this.connection.on_message(event);
        return mock_dispatcher.verify();
      });
    });
    describe('.on_close', function() {
      return it('should dispatch the connection_closed event', function() {
        var mock_dispatcher;
        mock_dispatcher = sinon.mock(this.connection.dispatcher);
        mock_dispatcher.expects('dispatch').once();
        this.connection.on_close();
        return mock_dispatcher.verify();
      });
    });
    return describe('.flush_queue', function() {
      beforeEach(function() {
        this.event = new WebSocketRails.Event(['event', 'message']);
        this.connection.message_queue.push(this.event);
        return this.connection._conn = {
          send: function() {
            return true;
          }
        };
      });
      it('should send out all of the messages in the queue', function() {
        var mock_connection;
        mock_connection = sinon.mock(this.connection._conn);
        mock_connection.expects('send').once().withArgs(this.event.serialize());
        this.connection.flush_queue();
        return mock_connection.verify();
      });
      return it('should empty the queue after sending', function() {
        expect(this.connection.message_queue.length).toEqual(1);
        this.connection.flush_queue();
        return expect(this.connection.message_queue.length).toEqual(0);
      });
    });
  });

}).call(this);
