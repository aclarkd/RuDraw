class CreateDrawables < ActiveRecord::Migration
  def change
    create_table :drawables do |t|
      t.string :name
      t.integer :score

      t.timestamps
    end
  end
end
