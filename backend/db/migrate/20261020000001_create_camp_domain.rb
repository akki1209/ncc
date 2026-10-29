class CreateCampDomain < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :encrypted_password, null: false, default: ''
      t.integer :role, null: false, default: 0
      t.boolean :active, null: false, default: false
      t.boolean :invitation_pending, null: false, default: false
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.timestamps
    end
    add_index :users, 'lower(email)', unique: true
    add_index :users, :reset_password_token, unique: true
    add_check_constraint :users, 'role IN (0,1)', name: 'valid_user_role'
    create_table :student_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :full_name, null: false
      t.date :date_of_birth, null: false
      t.string :gender, null: false
      t.string :blood_group
      t.string :mobile_number, null: false
      t.string :institution_name, null: false
      t.string :course_or_class, null: false
      t.decimal :height_cm
      t.decimal :weight_kg
      t.timestamps
    end
    create_table :programs do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :description
      t.text :short_description
      t.text :eligibility_criteria
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.string :location, null: false
      t.integer :capacity
      t.integer :status, null: false, default: 0
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :programs, :slug, unique: true
    add_check_constraint :programs, 'end_date >= start_date', name: 'valid_program_dates'
    add_check_constraint :programs, 'capacity IS NULL OR capacity > 0', name: 'positive_capacity'
    create_table :enrollments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :program, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.integer :progress_percent, null: false, default: 0
      t.datetime :enrolled_at, null: false
      t.datetime :completed_at
      t.boolean :eligibility_confirmed, null: false, default: false
      t.text :remarks
      t.timestamps
    end
    add_index :enrollments, [:user_id, :program_id], unique: true
    add_check_constraint :enrollments, 'progress_percent BETWEEN 0 AND 100', name: 'valid_progress'
    add_check_constraint :enrollments, 'status != 2 OR (progress_percent = 100 AND completed_at IS NOT NULL)', name: 'valid_completion'
    create_table :certificates do |t|
      t.references :enrollment, null: false, foreign_key: true, index: { unique: true }
      t.references :issued_by, null: false, foreign_key: { to_table: :users }
      t.string :certificate_number, null: false
      t.string :student_name_snapshot, null: false
      t.string :program_title_snapshot, null: false
      t.date :program_start_date_snapshot, null: false
      t.date :program_end_date_snapshot, null: false
      t.string :location_snapshot, null: false
      t.datetime :issued_at, null: false
      t.integer :status, null: false, default: 0
      t.datetime :revoked_at
      t.text :revocation_reason
      t.string :generation_status, null: false, default: 'pending'
      t.text :generation_error
      t.timestamps
    end
    add_index :certificates, :certificate_number, unique: true
    create_table :audit_logs do |t|
      t.references :actor, null: false, foreign_key: { to_table: :users }
      t.string :action, null: false
      t.references :auditable, polymorphic: true, null: false
      t.jsonb :metadata, null: false, default: {}
      t.datetime :created_at, null: false
    end
  end
end
