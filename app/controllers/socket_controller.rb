class SocketController < WebsocketRails::BaseController
  def initialize_session
    # perform application setup here
    controller_store[:connected] = []
    controller_store[:current_presenter] = 0
    controller_store[:requested_presenter] = 0
    controller_store[:current_item] = ''
    controller_store[:timer] = 60
  end

  # connection management
  def client_connected
    controller_store[:connected].push(message[:connection_id])
    if controller_store[:connected].length > 1 and controller_store[:current_presenter] == 0
      broadcast_presenter
    end
  end

  def client_disconnected
    controller_store[:connected].delete(message[:connection_id])
    if controller_store[:current_presenter] == message[:connection_id]
      controller_store[:current_presenter] = 0
      broadcast_presenter
    end
    broadcast_message :client_disconnected, { :connection_id => message[:connection_id] }
  end

  # game state management
  def broadcast_presenter(presenter_id = false) # ask random client to become presenter, on return of acceptance client will be sent item to draw
    presenter_id = presenter_id || controller_store[:connected].sample
    controller_store[:requested_presenter] = presenter_id
    broadcast_message :receive_presenter, { }
  end

  # acknowledge presenter, send item to draw, start timer
  def accept_presenter
    if message[:connection_id] == controller_store[:requested_presenter] # only requested presenter may accept
      controller_store[:current_presenter] = message[:connection_id]
      controller_store[:current_item] = 'dog'
      send_message :receive_item_to_draw, { :item => controller_store[:current_item] }
      broadcast_time
    end
  end

  # receive guess from player, promote to presenter if its correct
  def guess
    if controller_store[:current_presenter] != message[:connection_id] and controller_store[:current_item] == message[:guess]
      broadcast_clear_canvas
      broadcast_presenter message[:connection_id]
    end
  end

  # start the timer
  def broadcast_time
    broadcast_message :receive_time, { :time => controller_store[:timer] }
  end

  # canvas relay/controls
  def broadcast_coordinates
    if is_presenter message[:connection_id]
      broadcast_message :receive_coordinates, { :message => message }
    end
  end

  # clear all canvases
  def broadcast_clear_canvas
    if is_presenter message[:connection_id] #only presenter can clear
      broadcast_message :receive_clear, { :message => message }
    end
  end

  # used to test new routes
  def test
    broadcast_message :test, { :current_presenter => controller_store[:current_presenter],
                               :connected => controller_store[:connected] }
  end

  def is_presenter(connection_id)
    return connection_id == controller_store[:current_presenter]
  end
end
