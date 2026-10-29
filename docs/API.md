# JSON API

Base path `/api/v1`. Success: `{ "data": ..., "meta": {} }`. Collections support page and per_page (maximum 100), return total/page/per_page. Errors: `{ "error": { "code": "...", "message": "...", "details": {} } }`. Status codes: 401 unauthenticated, 403 unauthorized, 404 unknown or inaccessible, 409 duplicate constraint, 422 validation/CSRF failure.

## Session authentication

GET auth/csrf returns data.csrf_token and a session cookie. Send that cookie plus X-CSRF-Token for POST, PATCH and PUT. POST auth/login takes email/password. Refresh the CSRF token after login rotates the session. GET auth/me returns only safe account/profile fields. POST auth/logout clears the session. POST auth/password takes email, returns a generic response; PUT auth/password takes token, password, password_confirmation. Password minimum is 12 characters. No tokens in localStorage.

## Public

GET public/programs returns a minimal list of published/ongoing institutional programs.

## Admin

- GET dashboard, GET reports: aggregate statistics and recent activity.
- GET students: optional q, active. POST students: email and profile object (full_name, date_of_birth, gender, mobile_number, institution_name, course_or_class; optional blood_group, height_cm, weight_kg). Creates a pending account and sends a setup link.
- GET/PATCH students/:id; patch accepts profile. PATCH students/:id/activate or deactivate. GET students/:id/enrollments and certificates.
- GET/POST programs; GET/PATCH programs/:id. Create/update use a program object with title, location, start_date, end_date, optional description, short_description, eligibility_criteria, capacity. Status is never mass assigned.
- POST programs/:id/publish, start, complete, cancel: explicit state transitions.
- POST programs/:id/enrollments: user_id, eligibility_confirmed=true. POST programs/:id/bulk_enrollments: user_ids (1–100), eligibility_confirmed=true. A bulk batch is atomic.
- GET enrollments: optional student_id, program_id, status. GET enrollments/:id. PATCH enrollments/:id/progress: progress_percent and remarks. POST enrollments/:id/complete, fail, withdraw. Terminal statuses cannot be edited.
- GET certificates: optional student_id/status. GET certificates/:id. POST enrollments/:id/certificate and programs/:id/generate_certificates queue qualifying PDFs. POST certificates/:id/revoke takes reason; POST certificates/:id/reissue replaces issue number/snapshot and queues a fresh PDF. GET certificates/:id/download returns an authorized active PDF.

## Student

GET dashboard returns personal training summary. GET/PATCH profile; permitted update fields are full_name, mobile_number, blood_group, height_cm, weight_kg. GET programs and programs/:id use **enrollment IDs** and show only the signed-in student’s training. GET certificates and certificates/:id show personal active issues. GET certificates/:id/download delivers a private PDF attachment.

Program states: draft → published → ongoing → completed; draft/published/ongoing → cancelled. Enrollment: assigned/in_progress → completed/failed/withdrawn; explicit completion requires progress 100. Completing a program does not silently pass cadets. Certificate jobs are safe to retry and ordinary generation never reactivates a revoked issue.
