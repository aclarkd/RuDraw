class SocketController < WebsocketRails::BaseController
  def initialize_session
    # perform application setup here
    controller_store[:connected] = []
    controller_store[:presenter] = 0
  end

  # connection management
  def client_connected
    send_message :client_connected, { :connection_id => message[:connection_id] }
  end

  def register_connection
    controller_store[:connected].push(message[:connection_id])
    if controller_store[:connected].length > 1 and controller_store[:presenter] == 0
         broadcast_presenter
    end
  end

  def unregister_connection
    controller_store[:connected].delete(message[:connection_id])
  end

  # game state management
  def broadcast_presenter
    broadcast_message :receive_presenter, { :presenter_id => controller_store[:connected].sample }
  end

  def accept_presenter
    controller_store[:presenter] = message[:connection_id]
  end

  # canvas relay/controls
  def broadcast_coordinates
    broadcast_message :receive_coordinates, { :message => message }
  end

  def broadcast_clear_canvas
    broadcast_message :receive_clear, { :message => message }
  end

  # used to test new routes
  def test
    broadcast_message :test, { :message => controller_store[:presenter] }
  end
end
