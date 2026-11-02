# RPR DUET Admission Care — Exam Management Module

## What this is

A working React/JavaScript admin **frontend prototype** for creating exams, entering marks, importing/exporting native Excel `.xlsx` sheets, calculating merit positions and previewing results. Built to integrate with your **existing student database**. The prototype contains **no real database or backend authentication**.

**Important:** DEMO mode uses fictional student records and browser localStorage. Do not present demo marks as real records. Live production mode requires the 7 endpoints below and server-side authorization.

## Run locally

1. Install Node.js 20+.
2. Open this folder in VS Code's terminal.
3. `npm install`
4. Copy `.env.example` to `.env` and keep `VITE_USE_MOCK=true` for trial.
5. `npm run dev`, then open the URL printed in terminal.
6. `npm run build` to verify the production bundle.

## Connect existing RPR student records

Set `VITE_USE_MOCK=false` in `.env`, set `VITE_API_BASE_URL` only if the backend isn't hosted at the same origin, and implement these paths. Every response should be JSON. All admin endpoints MUST require a properly authorized admin/teacher session. Use a same-origin authenticated session cookie and CSRF protection (or your existing safe auth design); **never store an admin API key/password in the frontend**.

| HTTP | Route | Purpose |
|---|---|---|
| GET | `/api/admin/exams/batches` | Existing batch list |
| GET | `/api/admin/exams/students?batchId=...&search=...` | Existing students in selected batch (read-only) |
| GET | `/api/admin/exams` | List exams |
| POST | `/api/admin/exams` | Create exam |
| PATCH | `/api/admin/exams/:examId/status` | Publish / unpublish |
| GET | `/api/admin/exams/:examId/marks` | Previously saved exam marks |
| PUT | `/api/admin/exams/:examId/marks` | Bulk upsert marks |

The frontend currently assumes the GET list endpoints return raw arrays. Adapt `src/api.js` if your backend wraps lists in `{ data: [...] }`.

### Minimal JSON data models

**Batch**
```json
{ "id": "alpha-2026", "name": "1. Alpha 2026" }
```

**Existing student** — `id` is the same UNIQUE, stable Student/System ID already used at `rprdac.com`:
```json
{ "id": "RPR-2026001", "name": "Student Name", "department": "EEE", "batchId": "alpha-2026" }
```

**Exam**
```json
{ "id": "exam-123", "title": "Model Test - 1", "subject": "Math", "date": "2026-10-26", "batchId": "alpha-2026", "fullMarks": 100, "status": "draft" }
```

**POST create exam**
```json
{ "title": "Model Test - 1", "subject": "Math", "date": "2026-10-26", "batchId": "alpha-2026", "fullMarks": 100 }
```
Response: created full Exam object (with `id` and `status` fields).

**PATCH publication status**
```json
{ "status": "published" }
```
Response: updated Exam object.

**GET marks** response
```json
[
  { "studentId": "RPR-2026001", "marks": 85, "absent": false },
  { "studentId": "RPR-2026002", "marks": null, "absent": true }
]
```

**PUT marks** request
```json
{
  "entries": [
    { "studentId": "RPR-2026001", "marks": 85, "absent": false },
    { "studentId": "RPR-2026002", "marks": null, "absent": true }
  ]
}
```
Response: `{ "updated": 2 }`.

## Database design / non-duplication

Use existing `students` and `batches` tables as the **single source of truth**. Create only new `exams` and `exam_marks` tables. Recommended constraints:

- `exams`: `id` PK, `batch_id` FK existing batch, `title`, `subject`, `exam_date`, `full_marks DECIMAL(8,2) CHECK (full_marks > 0)`, `status ('draft'|'published')`, `created_by`, `created_at`, `published_at`.
- `exam_marks`: `exam_id` FK, `student_id` FK existing student, `marks DECIMAL(8,2) NULL`, `absent BOOLEAN NOT NULL`, `updated_by`, `updated_at`, **UNIQUE(exam_id, student_id)**.
- Existing Student/System ID may be a visible code distinct from the internal DB primary key. Backend must resolve the stable existing student ID and return a consistent `id` field; never treat an editable phone number as the primary key.

### Server-side validation (mandatory)

1. Verify authorized admin/teacher; optionally restrict which batches a teacher may edit.
2. Reject unknown students and students not in the exam's batch.
3. Check `0 <= marks <= fullMarks`; mark `absent` and numeric marks are mutually exclusive.
4. Reject marks editing on `published` exams unless first unpublished.
5. Validate exam date and title; prevent duplicate unwanted entries; use DB transaction for bulk upsert.
6. Publish only after validating saved records per coaching policy (possibly allow absentees, require all students marked).
7. Keep update/publish audit trail with user and timestamp. Rate limit administrative and student-facing endpoints.
8. Store data in your existing DB with regular backups. Do not store real exam records only in browser localStorage.

## Student-facing result portal (future integration)

The in-app `Individual Student Result` page is an **ADMIN PREVIEW ONLY** and searches records already fetched for the selected batch. Do not expose this admin endpoint publicly. The developer should add a separate authenticated student-facing endpoint that returns only the logged-in student's **published** marks, or require verified OTP login. Student ID alone is not strong authentication.

## Behaviour / key features

- No Student Add/Edit/Delete: reads existing student info.
- Exam creation + draft/publish states.
- Excel template `.xlsx` download with Student ID & name; Excel `.xlsx` import maps by Student ID (not row number). **Import populates the form; press Save Marks to persist**.
- Blank marks are not submitted; zero `0` is a valid mark; absent entries have `marks: null`.
- Merit ranks use **standard competition ranking**: scores `90, 90, 80` get positions `1, 1, 3`; absent/blank are unranked.
- Export native `.xlsx` files and browser Print -> PDF.
- Demo persistence: same browser's localStorage only.

## Known scope boundaries

- The React package is a prototype, not a complete hosted standalone secure service.
- Authentication, permissions, validation, audit log, backups, and live DB are **backend responsibilities**.
- No student login has been implemented. Do not assume placeholder `AD` avatar authenticates anything.
- This demo displays all students in each batch. Paginate on the backend for large classes, or add server-side filter/virtualization as needed.
- Real student and batch naming conventions can differ; adjust adapters (`src/api.js`) and mapping as needed.
