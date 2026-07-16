# Student Portal Dashboard

A full-stack student and administrator portal built with React, TypeScript, Redux Saga, Tailwind CSS, Express, MongoDB, and JWT authentication.

## Features

Students can register, sign in, manage their profile, use the AI study assistant, and view courses, assignments, attendance, and published results. Dashboard statistics are calculated from MongoDB rather than demo arrays.

Administrators use the same sign-in form and are redirected to a protected admin area with:

- Live dashboard totals and recent activity
- Student account management and activation status
- Course and assignment CRUD
- Attendance and result CRUD
- Server-side pagination and debounced search
- Responsive sidebar, tables, forms, empty states, and dark mode

## Architecture

```text
frontend/src/
  api/                  Axios instance and JWT interceptors
  components/           Shared student components and role guards
  components/admin/     Shared admin layout and sidebar
  pages/                Student pages
  pages/admin/          Admin dashboard and reusable resource page
  redux/                Authentication and admin Redux Saga modules
  services/             Typed API access

backend/
  controllers/          Authentication, student, and admin request handlers
  middleware/           JWT authorization, uploads, and errors
  models/               User, Course, Assignment, Attendance, Result, activity
  routes/               Student and protected admin endpoints
  scripts/seedAdmin.js  Environment-driven admin creation
  utils/                 Pagination, search sanitization, grades, audit helpers
```

## Environment setup

Copy `backend/.env.example` to `backend/.env` and replace the example values. Never commit `.env`.

Required variables:

```env
MONGO_URI=
JWT_SECRET=
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

The AI assistant also requires `OPENAI_API_KEY` if that feature is enabled.

## Create an administrator

Public registration always creates a student. Administrators are created only through the seed command:

```bash
cd backend
npm install
npm run seed:admin
```

The script reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `backend/.env`, requires a password of at least 12 characters, and refuses duplicates.

## Run locally

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Routes

Student routes: `/dashboard`, `/courses`, `/assignments`, `/attendance`, `/results`, `/settings`.

Admin routes: `/admin/dashboard`, `/admin/students`, `/admin/courses`, `/admin/assignments`, `/admin/attendance`, `/admin/results`, `/admin/settings`.

Role guards redirect students away from admin pages and administrators away from student-only pages. Backend admin routes independently enforce the admin role.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/dashboard`
- `/api/profile`, `/api/courses`, `/api/assignments`
- `GET /api/attendance`, `GET /api/results`
- `GET /api/admin/dashboard`
- CRUD `/api/admin/students`
- CRUD `/api/admin/courses`
- CRUD `/api/admin/assignments`
- CRUD `/api/admin/attendance`
- CRUD `/api/admin/results`

List endpoints accept `page`, `limit`, and `search`. Student listing additionally supports program, semester, status, and safe sorting.

Deleting a student cascades their courses, assignments, attendance, and results. Students only receive their own attendance and published results.

## Security

- bcrypt password hashing and selected-out password fields
- JWT verification with role loaded from the database
- inactive-account login and API blocking
- protected admin endpoints
- Helmet headers, restricted CORS, login rate limiting, and a 1 MB JSON limit
- MIME/type and size checks for uploaded profile images
- escaped regular-expression searches and validated MongoDB IDs
- centralized safe error responses
- audit records without credentials or tokens

## Verification

```bash
cd backend
npm test

cd ../frontend
npm run lint
npm run build
```

The Vite build may display third-party Hugeicons annotation warnings; they come from dependency output and do not fail the build.

## Data assumptions

Existing users without an explicit role behave as students. Only published results appear to students. Attendance percentages count Present and Late as attended and exclude Excused entries from the denominator.
