# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_10_20_090000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "audit_logs", force: :cascade do |t|
    t.bigint "actor_id", null: false
    t.string "action", null: false
    t.string "auditable_type", null: false
    t.bigint "auditable_id", null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.index ["actor_id"], name: "index_audit_logs_on_actor_id"
    t.index ["auditable_type", "auditable_id"], name: "index_audit_logs_on_auditable"
  end

  create_table "certificates", force: :cascade do |t|
    t.bigint "enrollment_id", null: false
    t.bigint "issued_by_id", null: false
    t.string "certificate_number", null: false
    t.string "student_name_snapshot", null: false
    t.string "program_title_snapshot", null: false
    t.date "program_start_date_snapshot", null: false
    t.date "program_end_date_snapshot", null: false
    t.string "location_snapshot", null: false
    t.datetime "issued_at", null: false
    t.integer "status", default: 0, null: false
    t.datetime "revoked_at"
    t.text "revocation_reason"
    t.string "generation_status", default: "pending", null: false
    t.text "generation_error"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["certificate_number"], name: "index_certificates_on_certificate_number", unique: true
    t.index ["enrollment_id"], name: "index_certificates_on_enrollment_id", unique: true
    t.index ["issued_by_id"], name: "index_certificates_on_issued_by_id"
  end

  create_table "enrollments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "program_id", null: false
    t.integer "status", default: 0, null: false
    t.integer "progress_percent", default: 0, null: false
    t.datetime "enrolled_at", null: false
    t.datetime "completed_at"
    t.boolean "eligibility_confirmed", default: false, null: false
    t.text "remarks"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["program_id"], name: "index_enrollments_on_program_id"
    t.index ["user_id", "program_id"], name: "index_enrollments_on_user_id_and_program_id", unique: true
    t.index ["user_id"], name: "index_enrollments_on_user_id"
    t.check_constraint "progress_percent >= 0 AND progress_percent <= 100", name: "valid_progress"
    t.check_constraint "status <> 2 OR progress_percent = 100 AND completed_at IS NOT NULL", name: "valid_completion"
  end

  create_table "programs", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "description"
    t.text "short_description"
    t.text "eligibility_criteria"
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.string "location", null: false
    t.integer "capacity"
    t.integer "status", default: 0, null: false
    t.bigint "created_by_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_programs_on_created_by_id"
    t.index ["slug"], name: "index_programs_on_slug", unique: true
    t.check_constraint "capacity IS NULL OR capacity > 0", name: "positive_capacity"
    t.check_constraint "end_date >= start_date", name: "valid_program_dates"
  end

  create_table "student_profiles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "full_name", null: false
    t.date "date_of_birth", null: false
    t.string "gender", null: false
    t.string "blood_group"
    t.string "mobile_number", null: false
    t.string "institution_name", null: false
    t.string "course_or_class", null: false
    t.decimal "height_cm"
    t.decimal "weight_kg"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_student_profiles_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "role", default: 0, null: false
    t.boolean "active", default: false, null: false
    t.boolean "invitation_pending", default: false, null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "session_version", default: 0, null: false
    t.index "lower((email)::text)", name: "index_users_on_lower_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.check_constraint "role = ANY (ARRAY[0, 1])", name: "valid_user_role"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "audit_logs", "users", column: "actor_id"
  add_foreign_key "certificates", "enrollments"
  add_foreign_key "certificates", "users", column: "issued_by_id"
  add_foreign_key "enrollments", "programs"
  add_foreign_key "enrollments", "users"
  add_foreign_key "programs", "users", column: "created_by_id"
  add_foreign_key "student_profiles", "users"
end
