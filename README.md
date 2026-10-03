# MedClinic

Front-end for a medical clinic admin portal, built for the CA2 assignment in Front-End Development. It is a React single page app that talks to a separate REST API for all of its data. Admins manage doctors, patients, appointments, prescriptions and diagnoses. Everyone else who registers gets a smaller patient portal.

Live: https://ca2-medical-app.web.app/welcome (Firebase Hosting)

## Stack

- React 19 and Vite 7, plain JavaScript (JSX)
- Tailwind CSS 4 through the `@tailwindcss/vite` plugin, shadcn/ui components (new-york style, Radix underneath), lucide and Tabler icons
- React Router 7 (`react-router-dom`)
- Axios for the API, `jwt-decode` for reading the login token
- React Hook Form with Zod for form validation
- Recharts for the dashboard charts, React Big Calendar for the schedule, Framer Motion for table and page animation
- `next-themes` is installed, but the dark mode toggle uses a small custom `ThemeProvider` in `src/components/theme-provider.jsx`
- Sonner for toasts
- Firebase Hosting for deployment

## Features

Everything below is in the code.

Public side:
- Landing page at `/welcome`, login and register tabs at `/auth`. Both forms are validated with Zod before anything is sent.
- Logged-in users are bounced away from these pages to the right dashboard.

Admin side (sidebar layout):
- Dashboard with counts of doctors, patients and appointments, a bar chart of those counts, a pie chart of doctors by specialisation, the five newest patients, a CSV export of those five, and a current temperature card for Dublin from the Open-Meteo API.
- Doctors: create, edit, delete, search by name or specialisation, and a detail page.
- Patients: create, edit, delete, search, and a profile page with appointments, prescriptions and diagnoses in tabs.
- Appointments: create, edit, delete, and a detail page that pulls in the doctor and patient records.
- Prescriptions and diagnoses: create, edit, delete, detail pages. A prescription needs a doctor, a patient and a diagnosis.
- Calendar: appointments shown on a React Big Calendar. Clicking a day opens the booking form with that date filled in, and dragging an event to another day reschedules it.
- Breadcrumbs that show record names instead of ids once a detail page has loaded.

Patient portal (`/user-dashboard`, no sidebar):
- Finds the patient record whose email matches the logged-in account, then lists that patient's appointments, prescriptions and diagnoses.
- Lets the patient book an appointment with a chosen doctor and date.
- If a non-admin tries an admin URL they are sent here with an "Access Denied" toast.

## Getting started

```bash
git clone https://github.com/AdamPandey/ca2-medic-clinic.git
cd ca2-medic-clinic
npm install
npm run dev
```

Other scripts from `package.json`: `npm run build`, `npm run preview`, `npm run lint`. There are no tests.

No environment variables are used. The API address is hardcoded in `src/config/api.js` as `https://ca2-med-api.vercel.app`. That backend is not part of this repo, so the app needs that service to be up. The endpoints the front end calls are `/login`, `/register`, `/doctors`, `/patients`, `/appointments`, `/prescriptions` and `/diagnoses`.

To get an admin view, log in with the account whose email is set as `ADMIN_EMAIL` in `src/hooks/useAuth.jsx`. That account has to exist on the backend. Any other account lands on the patient portal.

## Project structure

```
src/
  App.jsx             routes and the three route guards
  main.jsx            entry, theme provider, calendar CSS
  config/api.js       Axios instance, adds the Bearer token to every request
  hooks/useAuth.jsx   AuthContext: login, register, logout, role
  context/            BreadcrumbContext
  pages/              Landing, Auth, Home (dashboard), UserDashboard, CalendarView
    doctors/ patients/ appointments/ prescriptions/ diagnoses/   Index.jsx (list + form) and Show.jsx (detail) for each
  components/         AdminRoute, Breadcrumbs, app-sidebar, mode-toggle, theme-provider
  components/ui/      shadcn/ui primitives
  lib/utils.js        cn() and date formatters
```

Path alias `@` points to `src` (see `vite.config.js` and `jsconfig.json`).

## How it works

Auth: login and register call the API, which returns a JWT. The token is stored in `localStorage` under `token`. On load, `AuthProvider` decodes it, drops it if `exp` has passed, and otherwise restores the session. The Axios interceptor attaches it to every request.

Roles: there is no role in the token. `useAuth.jsx` marks a user as admin when the decoded email equals the hardcoded `ADMIN_EMAIL`, and everyone else is `user`. `ProtectedRoute` (defined inside `App.jsx`) checks that someone is logged in and `AdminRoute` checks the role.

Data: pages fetch with Axios in `useEffect` and keep results in component state. There is no caching layer. Detail pages usually fetch the full list of a related resource and look the record up client-side. Deleting a patient first fetches and deletes that patient's appointments, prescriptions and diagnoses one by one, then the patient.

## Deployment

`firebase.json` serves the `dist` folder as a single page app (every path rewrites to `/index.html`) and `.firebaserc` points at the project `ca2-medical-app`. With the Firebase CLI installed and logged in:

```bash
npm run build
firebase deploy --only hosting
```

Hosting is the only Firebase feature used. The app source does not import the Firebase SDK, and there is no Firestore, Auth or Functions config.

## Known gaps

- The admin check is client-side only, based on an email string in the bundle. It hides pages but does not protect data. Real protection depends on what the backend enforces, and the backend is not in this repo.
- Appointments only store a date, not a time, and nothing checks for double booking.
- Only patient deletion cascades. Deleting a doctor who has appointments shows a "cannot delete" message when the API answers 409.
- A patient who registers has no patient record until an admin creates one with the same email, and until then booking fails with "Account not linked".
- `dist/` and `build/` are committed. `dist/` came in with the 2025-12-15 commit, so it is older than the current source. `build/index.html` is the default Firebase placeholder page and is not used by `firebase.json`. Neither folder is in `.gitignore`.
- Unused files left from scaffolding: `src/components/data-table.jsx`, `chart-area-interactive.jsx`, `section-cards.jsx`, `site-header.jsx`, `nav-*.jsx`, `Navbar.jsx`, `LoginForm.jsx`, `PageWrapper.jsx`, `DeleteBtn.jsx`, `components/examples/`, `src/app/dashboard/data.json`, `src/utils/dateUtils.js` (duplicated in `lib/utils.js`) and `src/pages/ProtectedRoute.jsx`, which reads a `token` that `useAuth` doesn't provide.
- `CalendarView.jsx` imports `moment`, which is not listed in `package.json`. It installs only because the lockfile pulls it in as a peer dependency of React Big Calendar.
- The package is still named `ca2-festivals-example`, from the course template.
- The landing page copy ("Start Free Trial", "Enterprise-grade security") is placeholder text. There is no trial or billing.

## Author

AdamPandey
