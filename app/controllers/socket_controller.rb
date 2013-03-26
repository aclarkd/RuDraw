class SocketController < WebsocketRails::BaseController
  def initialize_session
    # perform application setup here
    controller_store[:message_count] = 0
  end

  def client_connected
    new_message = {:message => 'this is a message'}
    send_message :client_connected, new_message
  end

  def broadcast_coordinates
    broadcast_message :recieve_coordinates, {:message => message}
  end
end
