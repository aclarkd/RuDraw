require 'test_helper'

class DrawablesControllerTest < ActionController::TestCase
  setup do
    @drawable = drawables(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:drawables)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create drawable" do
    assert_difference('Drawable.count') do
      post :create, drawable: { name: @drawable.name, score: @drawable.score }
    end

    assert_redirected_to drawable_path(assigns(:drawable))
  end

  test "should show drawable" do
    get :show, id: @drawable
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @drawable
    assert_response :success
  end

  test "should update drawable" do
    put :update, id: @drawable, drawable: { name: @drawable.name, score: @drawable.score }
    assert_redirected_to drawable_path(assigns(:drawable))
  end

  test "should destroy drawable" do
    assert_difference('Drawable.count', -1) do
      delete :destroy, id: @drawable
    end

    assert_redirected_to drawables_path
  end
end
