class DrawablesController < ApplicationController

  before_filter :authenticate_user!, :only => [:show, :new, :edit, :create, :update, :destroy]

  # GET /drawables
  # GET /drawables.json
  def index
    @drawables = Drawable.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @drawables }
    end
  end

  # GET /drawables/1
  # GET /drawables/1.json
  def show
    @drawable = Drawable.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @drawable }
    end
  end

  # GET /drawables/new
  # GET /drawables/new.json
  def new
    @drawable = Drawable.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @drawable }
    end
  end

  # GET /drawables/1/edit
  def edit
    @drawable = Drawable.find(params[:id])
  end

  # POST /drawables
  # POST /drawables.json
  def create
    @drawable = Drawable.new(params[:drawable])

    respond_to do |format|
      if @drawable.save
        format.html { redirect_to @drawable, notice: 'Drawable was successfully created.' }
        format.json { render json: @drawable, status: :created, location: @drawable }
      else
        format.html { render action: "new" }
        format.json { render json: @drawable.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /drawables/1
  # PUT /drawables/1.json
  def update
    @drawable = Drawable.find(params[:id])

    respond_to do |format|
      if @drawable.update_attributes(params[:drawable])
        format.html { redirect_to @drawable, notice: 'Drawable was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @drawable.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /drawables/1
  # DELETE /drawables/1.json
  def destroy
    @drawable = Drawable.find(params[:id])
    @drawable.destroy

    respond_to do |format|
      format.html { redirect_to drawables_url }
      format.json { head :no_content }
    end
  end

end
