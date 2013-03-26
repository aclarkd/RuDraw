(function() {

  describe('WebSocketRails:', function() {
    beforeEach(function() {
      this.url = 'localhost:3000/websocket';
      WebSocketRails.WebSocketConnection = function() {
        return {
          connection_type: 'websocket',
          flush_queue: function() {
            return true;
          }
        };
      };
      WebSocketRails.HttpConnection = function() {
        return {
          connection_type: 'http',
          flush_queue: function() {
            return true;
          }
        };
      };
      return this.dispatcher = new WebSocketRails(this.url);
    });
    describe('constructor', function() {
      it('should set the new_message method on connection to this.new_message', function() {
        return expect(this.dispatcher._conn.new_message).toEqual(this.dispatcher.new_message);
      });
      it('should set the initial state to connecting', function() {
        return expect(this.dispatcher.state).toEqual('connecting');
      });
      describe('when use_websockets is true', function() {
        return it('should use the WebSocket Connection', function() {
          var dispatcher;
          dispatcher = new WebSocketRails(this.url, true);
          return expect(dispatcher._conn.connection_type).toEqual('websocket');
        });
      });
      describe('when use_webosckets is false', function() {
        return it('should use the Http Connection', function() {
          var dispatcher;
          dispatcher = new WebSocketRails(this.url, false);
          return expect(dispatcher._conn.connection_type).toEqual('http');
        });
      });
      return describe('when the browser does not support WebSockets', function() {
        return it('should use the Http Connection', function() {
          var dispatcher;
          window.WebSocket = 'undefined';
          dispatcher = new WebSocketRails(this.url, true);
          return expect(dispatcher._conn.connection_type).toEqual('http');
        });
      });
    });
    describe('.new_message', function() {
      describe('when this.state is "connecting"', function() {
        beforeEach(function() {
          this.message = {
            data: {
              connection_id: 123
            }
          };
          return this.data = [['client_connected', this.message]];
        });
        it('should call this.connection_established on the "client_connected" event', function() {
          var mock_dispatcher;
          mock_dispatcher = sinon.mock(this.dispatcher);
          mock_dispatcher.expects('connection_established').once().withArgs(this.message.data);
          this.dispatcher.new_message(this.data);
          return mock_dispatcher.verify();
        });
        it('should set the state to connected', function() {
          this.dispatcher.new_message(this.data);
          return expect(this.dispatcher.state).toEqual('connected');
        });
        it('should flush any messages queued before the connection was established', function() {
          var mock_con;
          mock_con = sinon.mock(this.dispatcher._conn);
          mock_con.expects('flush_queue').once();
          this.dispatcher.new_message(this.data);
          return mock_con.verify();
        });
        it('should set the correct connection_id', function() {
          this.dispatcher.new_message(this.data);
          return expect(this.dispatcher.connection_id).toEqual(123);
        });
        return it('should call the user defined on_open callback', function() {
          var spy;
          spy = sinon.spy();
          this.dispatcher.on_open = spy;
          this.dispatcher.new_message(this.data);
          return expect(spy.calledOnce).toEqual(true);
        });
      });
      return describe('after the connection has been established', function() {
        beforeEach(function() {
          this.dispatcher.state = 'connected';
          return this.attributes = {
            data: 'message',
            channel: 'channel'
          };
        });
        it('should dispatch channel messages', function() {
          var data, mock_dispatcher;
          data = [['event', this.attributes]];
          mock_dispatcher = sinon.mock(this.dispatcher);
          mock_dispatcher.expects('dispatch_channel').once();
          this.dispatcher.new_message(data);
          return mock_dispatcher.verify();
        });
        it('should dispatch standard events', function() {
          var data, mock_dispatcher;
          data = [['event', 'message']];
          mock_dispatcher = sinon.mock(this.dispatcher);
          mock_dispatcher.expects('dispatch').once();
          this.dispatcher.new_message(data);
          return mock_dispatcher.verify();
        });
        return describe('result events', function() {
          beforeEach(function() {
            this.attributes['success'] = true;
            this.attributes['id'] = 1;
            this.event = {
              run_callbacks: function(data) {}
            };
            this.event_mock = sinon.mock(this.event);
            return this.dispatcher.queue[1] = this.event;
          });
          return it('should run callbacks for result events', function() {
            var data;
            data = [['event', this.attributes]];
            this.event_mock.expects('run_callbacks').once();
            this.dispatcher.new_message(data);
            return this.event_mock.verify();
          });
        });
      });
    });
    describe('.bind', function() {
      return it('should store the callback on the correct event', function() {
        var callback;
        callback = function() {};
        this.dispatcher.bind('event', callback);
        return expect(this.dispatcher.callbacks['event']).toContain(callback);
      });
    });
    describe('.dispatch', function() {
      return it('should execute the callback for the correct event', function() {
        var callback, event;
        callback = sinon.spy();
        event = new WebSocketRails.Event([
          'event', {
            data: 'message'
          }
        ]);
        this.dispatcher.bind('event', callback);
        this.dispatcher.dispatch(event);
        return expect(callback.calledWith('message')).toEqual(true);
      });
    });
    describe('triggering events with', function() {
      beforeEach(function() {
        this.dispatcher.connection_id = 123;
        return this.dispatcher._conn = {
          trigger: function() {},
          trigger_channel: function() {}
        };
      });
      return describe('.trigger', function() {
        return it('should delegate to the connection object', function() {
          var con_trigger, event;
          con_trigger = sinon.spy(this.dispatcher._conn, 'trigger');
          this.dispatcher.trigger('event', 'message');
          event = new WebSocketRails.Event([
            'websocket_rails.subscribe', {
              channel: 'awesome'
            }, 123
          ]);
          return expect(con_trigger.called).toEqual(true);
        });
      });
    });
    return describe('working with channels', function() {
      beforeEach(function() {
        return WebSocketRails.Channel = function(name, dispatcher, is_private) {
          this.name = name;
          this.dispatcher = dispatcher;
          this.is_private = is_private;
        };
      });
      describe('.subscribe', function() {
        describe('for new channels', function() {
          return it('should create and store a new Channel object', function() {
            var channel;
            channel = this.dispatcher.subscribe('test_channel');
            return expect(channel.name).toEqual('test_channel');
          });
        });
        return describe('for existing channels', function() {
          return it('should return the same Channel object', function() {
            var channel;
            channel = this.dispatcher.subscribe('test_channel');
            return expect(this.dispatcher.subscribe('test_channel')).toEqual(channel);
          });
        });
      });
      describe('.subscribe_private', function() {
        return it('should create private channels', function() {
          var private_channel;
          private_channel = this.dispatcher.subscribe_private('private_something');
          return expect(private_channel.is_private).toBe(true);
        });
      });
      return describe('.dispatch_channel', function() {
        return it('should delegate to the Channel object', function() {
          var channel, event, spy;
          channel = this.dispatcher.subscribe('test');
          channel.dispatch = function() {};
          spy = sinon.spy(channel, 'dispatch');
          event = new WebSocketRails.Event([
            'event', {
              channel: 'test',
              data: 'awesome'
            }
          ]);
          this.dispatcher.dispatch_channel(event);
          return expect(spy.calledWith('event', 'awesome')).toEqual(true);
        });
      });
    });
  });

}).call(this);
