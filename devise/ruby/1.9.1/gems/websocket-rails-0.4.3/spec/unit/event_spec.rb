require 'spec_helper'

module WebsocketRails
  describe Event do
    let(:encoded_message) { '["new_message",{"id":"1234","data":{"message":"this is a message"}}]' }
    let(:encoded_message_string) { '["new_message",{"id":"1234","data":"this is a message"}]' }
    let(:namespace_encoded_message_string) { '["product.new_message",{"id":"1234","data":"this is a message"}]' }
    let(:namespace_encoded_message) { '["product.new_message",{"id":"1234","data":{"message":"this is a message"}}]' }
    let(:channel_encoded_message_string) { '["new_message",{"id":"1234","channel":"awesome_channel","data":"this is a message","success":null,"result":null,"server_token":"1234"}]' }
    let(:synchronizable_encoded_message) { '["new_message",{"id":"1234","data":{"message":"this is a message"},"server_token":"1234"}]' }
    let(:connection) { double('connection') }

    before { connection.stub!(:id).and_return(1) }

    describe ".new_from_json" do
      context "messages in the global namespace" do
        it "should decode a new message and store it" do
          event = Event.new_from_json( encoded_message, connection )
          event.connection.should == connection
          event.name.should == :new_message
          event.namespace.should == [:global]
          event.data[:message].should == 'this is a message'
        end
      end

      context "messages in a child namespace" do
        it "should store the event with the correct namesapce" do
          event = Event.new_from_json( namespace_encoded_message, connection )
          event.namespace.should == [:global,:product]
          event.name.should == :new_message
          event.data[:message].should == 'this is a message'
        end
      end
    end

    describe ".new_on_open" do
      before { @event = Event.new_on_open connection, {:message => 'connected'} }

      it "should create an event named :client_connected" do
        @event.name.should == :client_connected
      end

      it "should send the connection id to the client" do
        @event.data[:connection_id].should == 1
      end

      it "should merge the optional data with the connection id" do
        @event.data[:message].should == 'connected'
      end
    end

    describe ".new_on_close" do
      it "should create an event named :client_disconnected" do
        event = Event.new_on_close( connection, "optional_data" )
        event.name.should == :client_disconnected
        event.data.should == "optional_data"
        event.connection.should == connection
      end
    end

    describe ".new_on_error" do
      it "should create an event named :client_error" do
        event = Event.new_on_error( connection, "optional_data" )
        event.name.should == :client_error
        event.data.should == "optional_data"
        event.connection.should == connection
      end
    end

    context "new namespaced events" do
      it "should store the namespace in the namespace attribute" do
        event = Event.new "event", :data => {}, :connection => connection, :namespace => :product
        event.namespace.should == [:global,:product]
        event.name.should == :event
      end

      it "should store nested namespaces in the namespace attribute" do
        event = Event.new "event", :data => {}, :connection => connection, :namespace => [:product,:x_ray_vision]
        event.namespace.should == [:global,:product,:x_ray_vision]
        event.name.should == :event
      end
    end

    context "new channel events" do
      it "should store the channel name in the channel attribute" do
        event = Event.new "event", :data => {}, :connection => connection, :channel => :awesome_channel
        event.channel.should == :awesome_channel
        event.name.should == :event
      end
    end

    describe "#is_channel?" do
      it "should return true if an event belongs to a channel" do
        event = Event.new "event", :data => "data", :channel => :awesome_channel
        event.is_channel?.should be_true
      end
    end

    describe "#is_invalid?" do
      it "returns true if the event name is :invalid_event" do
        event = Event.new(:invalid_event)
        event.is_invalid?.should be_true
      end
    end

    describe "#is_internal?" do
      it "returns true if the event is namespaced under websocket_rails" do
        event = Event.new(:internal_event, :namespace => :websocket_rails)
        event.is_internal?.should be_true
      end
    end

    describe "#serialize" do
      context "messages in the global namespace" do
        it "should not add the global namespace to the event name" do
          event = Event.new_from_json encoded_message_string, connection
          raw_data = event.serialize
          data = JSON.parse raw_data
          data[0].should == "new_message"
        end
      end

      context "messages in a child namespace" do
        it "should add the namespace to the front of the event name" do
          event = Event.new_from_json namespace_encoded_message_string, connection
          raw_data = event.serialize
          data = JSON.parse raw_data
          data[0].should == "product.new_message"
        end
      end

      context "messages for a channel" do
        it "should add the channel name as the first element of the serialized array" do
          event = Event.new_from_json channel_encoded_message_string, connection
          event.serialize.should == channel_encoded_message_string
        end
      end

      context "messages for synchronization" do
        it "should include the unique server token" do
          event = Event.new_from_json synchronizable_encoded_message, connection
          raw_data = event.serialize
          data = JSON.parse raw_data
          data[1]['server_token'].should == '1234'
        end
      end
    end

  end
end
