class SocketController < WebsocketRails::BaseController
  def initialize_session
    # perform application setup here
    controller_store[:connected] = []
    controller_store[:current_presenter] = 0
    controller_store[:requested_presenter] = 0
    controller_store[:current_item] = ''
    controller_store[:timer] = 60
    #controller_store[:score] = [] not currently working as expected
  end

  # connection management
  def client_connected
    controller_store[:connected].push(message[:connection_id])
    #controller_store[:score][message[:connection_id]] = 0
    if controller_store[:connected].length > 1 and controller_store[:current_presenter] == 0
      broadcast_presenter
    end
  end

  def client_disconnected
    controller_store[:connected].delete(message[:connection_id])
    #controller_store[:score].delete([message[:connection_id]])
    if controller_store[:current_presenter] == message[:connection_id]
      controller_store[:current_presenter] = 0
      if controller_store[:connected].length > 1 # set new presenter if 2 or more players
        broadcast_presenter
      end
    end
    broadcast_message :client_disconnected, { :connection_id => message[:connection_id] }
  end

  # game state management
  def broadcast_presenter(presenter_id = false) # ask random client to become presenter, on return of acceptance client will be sent item to draw
    presenter_id = presenter_id || controller_store[:connected].sample
    controller_store[:requested_presenter] = presenter_id
    broadcast_message :receive_presenter, { }
  end

  def timer_expired
    if controller_store[:current_presenter] == message[:connection_id]
      broadcast_presenter
    end
  end

  # acknowledge presenter, send item to draw, start timer
  def accept_presenter
    if message[:connection_id] == controller_store[:requested_presenter] # only requested presenter may accept
      controller_store[:current_presenter] = message[:connection_id]
      drawable = Drawable.find(:all).sample
      controller_store[:current_item] = drawable
      send_message :receive_item_to_draw, { :item => drawable.name }
      broadcast_message :receive_clear, { :message => {} }
      broadcast_time
    end
  end

  # receive guess from player, promote to presenter if its correct
  def guess
    correct = false
    if controller_store[:current_presenter] != message[:connection_id] and controller_store[:current_item].name.casecmp(message[:guess]) == 0
      #controller_store[:score][message[:connection_id]] += controller_store[:current_item].score
      #controller_store[:score][controller_store[:current_presenter]] += 1

      broadcast_clear_canvas
      broadcast_presenter message[:connection_id]
      broadcast_score(message[:connection_id], controller_store[:current_item].score)
      broadcast_score(controller_store[:current_presenter], 1)

      correct = true
    end
    broadcast_message :receive_guess, { :guess => message[:guess], :correct => correct, :user => message[:connection_id]}
  end

  def broadcast_score(connection_id, score)
    broadcast_message :receive_score, { :connection_id => connection_id, :score => score }
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
      broadcast_message :receive_clear, { :message => {} }
    end
  end

  def is_presenter(connection_id)
    return connection_id == controller_store[:current_presenter]
  end
end
