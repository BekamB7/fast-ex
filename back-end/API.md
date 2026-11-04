# Fast-Ex API

The Express API listens on port `5000` by default. Its route index
is `GET /api`, API documentation is `GET /api/docs`, and database readiness is
reported by `GET /api/health`.

The frontend uses `http://localhost:5000/api` by default. Set
`NEXT_PUBLIC_API_URL` in the frontend deployment environment when the API is
hosted elsewhere. The value may be the backend origin or its `/api` URL; the
frontend ensures the `/api` path is present.
All request and response bodies use JSON. Protected routes use
`Authorization: Bearer <token>`.

## Local setup

1. Copy `.env.example` to `.env` in `back-end/` and set the values for your
   MariaDB server and platform administrator.
2. Create the database and an application account in MySQL/MariaDB. Connect to
   the same server on port `3306` using a database administrator, then replace
   the example account and password below with the username/password used in
   `DATABASE_URL`:

   ```sql
   CREATE DATABASE fast_ex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'fast_ex_app'@'127.0.0.1' IDENTIFIED BY 'replace-with-a-strong-password';
   GRANT ALL PRIVILEGES ON fast_ex.* TO 'fast_ex_app'@'127.0.0.1';
   CREATE USER IF NOT EXISTS 'fast_ex_app'@'localhost' IDENTIFIED BY 'replace-with-a-strong-password';
   GRANT ALL PRIVILEGES ON fast_ex.* TO 'fast_ex_app'@'localhost';
   ```

   The example `DATABASE_URL` uses `127.0.0.1`; an existing `.env` using
   `localhost` needs the matching `@'localhost'` account. MySQL/MariaDB
   authorizes accounts by both username and host, so the connection hostname
   and account host must match. For a remote database, ask its administrator
   to allow the backend's actual client host and grant access to `fast_ex`.
   Do not solve this by using the database root account.

   The error `Host 'localhost' is not allowed to connect` means MariaDB
   rejected the client host for the configured database account. Verify the
   username, password, host grant, database name, and that MariaDB accepts
   TCP connections. Changing the hostname in `DATABASE_URL` only helps when
   the matching MariaDB host account is also permitted.
3. From `back-end/`, install dependencies if needed, then run:

   ```bash
   npm run prisma:generate
   npm run prisma:deploy
   npm run seed
   npm run dev
   ```

   The platform seed reads `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`,
   and optional `PLATFORM_ADMIN_NAME`; it does not create a public default
   password. Set a unique password of at least 12 characters. Re-running the
   seed updates that account's configured password and invalidates its sessions.
4. Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in
   `frontend/.env.local`, then start the frontend.
5. Confirm `GET http://localhost:5000/api/health` returns HTTP `200` and
   `"database": "connected"` before testing login.

If the database connection fails, the API process can still start. Health
returns HTTP `503` and login returns a database-unavailable response until the
database host permissions and connection settings are corrected.

## Response conventions

- Successful reads return an object containing the named resource, such as
  `{ "exams": [] }` or `{ "organization": {} }`.
- Invalid input returns `400` with `{ "error": "Invalid input", "details": [] }`.
- Missing resources return `404`; invalid credentials return `401`; inactive
  accounts return `403`.
- Database connection failures return `503` with a safe configuration hint.
- Other unexpected server failures return `500` with
  `{ "error": "Internal server error" }`; detailed errors are written to the
  API server log.
- Percentages are JSON numbers, not decimal strings.

## Authentication

Organization login returns `token` and `organization`. Platform login returns
`token` and `admin`. Store the appropriate token in the frontend and send it as
a Bearer token for protected requests. Organization and platform sessions are
separate.

## Routes

### Service

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api` | No | API version and route index |
| GET | `/api/docs` | No | This Markdown API reference |
| GET | `/api/health` | No | API and MariaDB readiness |

### Organization account

| Method | Path | Auth | Request / response |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | `{ name, adminEmail, password, phone?, address? }` → `{ organization }` |
| POST | `/api/auth/login` | No | `{ adminEmail, password }` → `{ token, organization }` |
| POST | `/api/auth/logout` | Organization | Deletes the current session |
| GET | `/api/auth/profile` | Organization | `{ organization }` with exam and attempt counts |
| PUT | `/api/auth/profile` | Organization | Update `name`, `adminEmail`, `phone`, `address`, `logo`, or `primaryColor`; returns `{ organization }` |
| PUT | `/api/auth/password` | Organization | `{ currentPassword, newPassword }`; changes the password and invalidates other organization sessions |
| GET | `/api/organization/dashboard` | Organization | `{ stats, recentAttempts }` |
| GET | `/api/organization/results?examId=<uuid>` | Organization | `{ results, blockedAttempts }`; `examId` is optional |
| GET | `/api/organization/students/lookup?phone=<phone>` | Organization | All matching exam attempts and blocked starts for a phone number |

Registration creates the organization but does not log it in; sign in at
`/dashboard/login` after registration.

### Organization exams

| Method | Path | Auth | Request / response |
| --- | --- | --- | --- |
| POST | `/api/exam/create` | Organization | Exam fields and `questions[]` → `{ exam, examCode }` |
| GET | `/api/exam/organization` | Organization | `{ exams }` for the signed-in organization |
| GET | `/api/exam/:id` | Organization | `{ exam }`, including questions and attempts |
| PUT | `/api/exam/:id` | Organization | Update exam details; include `questions[]` to replace questions before any attempts exist (question editing is locked after an attempt starts) |
| PATCH | `/api/exam/:id/status` | Organization | `{ isActive: boolean }` → `{ exam }` |

Exam creation fields: `title`, `description?`, `batchYear`, `language`,
`timeLimitMinutes`, `totalQuestions`, `passingScore`, and `questions`. Each
question has `questionNumber`, `questionText`, `questionType` (`mcq`,
`truefalse`, or `fillblank`), optional `optionA`–`optionD`, `correctAnswer`,
and optional `marks`.

### Public organization and student exam flow

| Method | Path | Auth | Request / response |
| --- | --- | --- | --- |
| GET | `/api/public/:slug` | No | `{ organization, exams, filters }` |
| GET | `/api/public/:slug/exams?batchYear=&language=&search=` | No | `{ organization, exams, filters, total }` |
| POST | `/api/public/:slug/validate` | No | `{ examCode, batchYear?, language? }` → `{ valid, exam }` |
| POST | `/api/public/:slug/exam/start` | No | `{ examCode, studentName, studentPhone, studentEmail? }` → attempt, exam, and safe question data |
| POST | `/api/public/:slug/exam/submit` | No | `{ attemptId, answers: { [questionId]: answer } }` → graded result |
| GET | `/api/public/:slug/exam/result/:attemptId` | No | `{ attempt }` |

The public exam start response intentionally omits correct answers. Use an
active organization slug and exam code. Student phone numbers are normalized
before saving. Repeated starts for an in-progress attempt resume it; completed
duplicate starts and phone/name conflicts are recorded in
`blocked_exam_attempts` for review in the organization workspace.

Apply the `add_blocked_exam_attempts` migration with `npm run prisma:deploy`
before starting the updated backend.

### Platform administration

| Method | Path | Auth | Request / response |
| --- | --- | --- | --- |
| POST | `/api/platform/login` | No | `{ email, password }` → `{ token, admin }` |
| POST | `/api/platform/logout` | Platform | Deletes the current session |
| GET | `/api/platform/profile` | Platform | `{ admin }` |
| PUT | `/api/platform/profile` | Platform | `{ name?, email? }` → `{ admin }` |
| PUT | `/api/platform/password` | Platform | `{ currentPassword, newPassword }` |
| GET | `/api/platform/stats` | Platform | `{ stats, recentOrganizations, recentAttempts }` |
| GET | `/api/platform/organizations?search=&status=` | Platform | `{ organizations }`; status is `active` or `inactive` |
| GET | `/api/platform/organizations/:id` | Platform | `{ organization, attempts, stats }` |
| PATCH | `/api/platform/organizations/:id/status` | Platform | `{ isActive: boolean }` |
| GET | `/api/platform/exams?search=&organizationId=` | Platform | `{ exams }` |
| GET | `/api/platform/exams/:id` | Platform | `{ exam }`, including questions and recent attempts |
| GET | `/api/platform/attempts?search=&limit=` | Platform | `{ attempts }`; `limit` is capped at 200 |
| GET | `/api/platform/attempts/:id` | Platform | `{ attempt }`, including exam and question details |

The frontend and API use `PUT /api/platform/password`. Password changes
invalidate other platform sessions.
