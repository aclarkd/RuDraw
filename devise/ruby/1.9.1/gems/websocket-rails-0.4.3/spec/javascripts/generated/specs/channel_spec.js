(function() {

  describe('WebSocketRails.Channel:', function() {
    beforeEach(function() {
      this.dispatcher = {
        new_message: function() {
          return true;
        },
        dispatch: function() {
          return true;
        },
        trigger_event: function(event) {
          return true;
        },
        state: 'connected',
        connection_id: 12345
      };
      this.channel = new WebSocketRails.Channel('public', this.dispatcher);
      return sinon.spy(this.dispatcher, 'trigger_event');
    });
    afterEach(function() {
      return this.dispatcher.trigger_event.restore();
    });
    describe('public channels', function() {
      beforeEach(function() {
        this.channel = new WebSocketRails.Channel('forchan', this.dispatcher, false);
        return this.event = this.dispatcher.trigger_event.lastCall.args[0];
      });
      it('should trigger an event containing the channel name', function() {
        return expect(this.event.data.channel).toEqual('forchan');
      });
      it('should trigger an event containing the correct connection_id', function() {
        return expect(this.event.connection_id).toEqual(12345);
      });
      it('should initialize an empty callbacks property', function() {
        expect(this.channel._callbacks).toBeDefined();
        return expect(this.channel._callbacks).toEqual({});
      });
      it('should be public', function() {
        return expect(this.channel.is_private).toBeFalsy;
      });
      return describe('.bind', function() {
        return it('should add a function to the callbacks collection', function() {
          var test_func;
          test_func = function() {};
          this.channel.bind('event_name', test_func);
          expect(this.channel._callbacks['event_name'].length).toBe(1);
          return expect(this.channel._callbacks['event_name']).toContain(test_func);
        });
      });
    });
    return describe('private channels', function() {
      beforeEach(function() {
        this.channel = new WebSocketRails.Channel('forchan', this.dispatcher, true);
        return this.event = this.dispatcher.trigger_event.lastCall.args[0];
      });
      it('should trigger a subscribe_private event when created', function() {
        return expect(this.event.name).toEqual('websocket_rails.subscribe_private');
      });
      return it('should be private', function() {
        return expect(this.channel.is_private).toBe(true);
      });
    });
  });

}).call(this);
