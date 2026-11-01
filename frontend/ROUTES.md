# Frontend routes

This document lists the browser pages implemented by the Next.js App Router.
Dynamic segments are shown in brackets; replace them with real values when
opening a route. The organization and exam pages are public, while dashboard
and platform administration pages require their respective sign-ins.

## Public and marketing pages

| Route | Page | What it is for |
| --- | --- | --- |
| `/` | Landing page | Fast-Ex introduction and links to learn more or register an organization. |
| `/about` | About | Information about the platform. |
| `/contact` | Contact | Contact information and message form. |
| `/get-going` | Organization registration | Register an organization; after registration, continue to `/dashboard/login`. |

## Student exam pages

Organizations share their public portal URL with students. The `slug` is the
organization's URL slug, created when the organization registers. A student can
open the portal, choose an available exam or enter its exam code, then provide
their details and take it.

| Route | Page | What it is for |
| --- | --- | --- |
| `/<slug>` | Organization portal | Shows an active organization's public exams and lets students find an exam using its code. |
| `/<slug>/exam/<code>` | Exam | Validates the exam code, collects student details, presents the exam, and submits answers. |
| `/<slug>/exam/<code>/result/<attemptId>` | Exam result | Displays the submitted attempt's result. |

Example: if an organization's slug is `northview-college`, its portal is
`https://<site-host>/northview-college`. A student can select an exam listed on
that portal or enter an exam code. The resulting exam link looks like
`https://<site-host>/northview-college/exam/EX2026-ENG-NORTH`.

The main site's marketing navigation does not provide a generic student
“Take an exam” link because a student needs the organization's slug to reach
the correct portal. Organizations should share their own portal URL.

## Organization workspace

These pages are for organization administrators. Sign in at `/dashboard/login`;
the workspace redirects users without an organization session to that page.

| Route | Page | What it is for |
| --- | --- | --- |
| `/dashboard/login` | Organization sign-in | Sign in to an organization's workspace. |
| `/dashboard` | Dashboard | Organization overview and recent attempts. |
| `/dashboard/exams` | Exams | View and manage the organization's exams. |
| `/dashboard/exams/create` | Create exam | Create an exam and its questions. |
| `/dashboard/results` | Results | Review and export student results. |
| `/dashboard/results?examId=<exam-id>` | Filtered results | Open results with a particular exam preselected. |
| `/dashboard/settings` | Organization settings | Update organization details and branding, copy the public portal URL, or change the administrator password. |

## Platform administration

These pages are for Fast-Ex platform administrators. Sign in at `/admin/login`;
the protected administration pages redirect users without a platform session
to that page.

| Route | Page | What it is for |
| --- | --- | --- |
| `/admin/login` | Platform sign-in | Sign in as a platform administrator. |
| `/admin` | Admin dashboard | Platform-wide overview. |
| `/admin/profile` | Admin profile | View and update platform administrator profile and password. |
| `/admin/organizations` | Organizations | Search and manage registered organizations. |
| `/admin/organizations/<id>` | Organization details | View a specific organization and its activity. |
| `/admin/exams` | Exams | Search and inspect exams across organizations. |
| `/admin/exams/<id>` | Exam details | View a specific exam and its attempts. |
| `/admin/attempts` | Attempts | Search and inspect student exam attempts platform-wide. |
| `/admin/attempts/<id>` | Attempt details | View the details of one student attempt. |

## Route parameters and notes

- `<slug>` is the organization's public URL slug, not its display name.
- `<code>` is the exam's exam code. It belongs to the organization in `<slug>`.
- `<attemptId>` is the attempt identifier returned after a student submits.
- `<id>` on admin detail pages is the database ID for the selected record.
- Angle-bracket placeholders are explanatory; actual URLs contain the values
  without angle brackets.
- The route list reflects the page files under `frontend/app`. API endpoints
  are documented separately in [`../back-end/API.md`](../back-end/API.md).
