# MedClinic - Medical Practice Management System

[![Firebase Deploy](https://img.shields.io/badge/deploy-firebase-yellow.svg)](https://ca2-medical-app.web.app/welcome)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A comprehensive, responsive, and feature-rich administration portal for a medical clinic. Built with React (Vite), Tailwind CSS, and ShadCN UI, this application serves as a master-detail interface for managing doctors, patients, appointments, and medical records via a REST API.

# Admin email: admin@medclinic.com
## Admin password: 12345678

## 🚀 Live Demo

**[View the Live Application Here](https://ca2-medical-app.web.app/welcome)**

---

## 🌟 Key Features

This project was engineered to exceed the brief requirements, featuring complex state management, security best practices, and a polished UI.

### 🔐 Authentication & Security
-   **Role-Based Access Control (RBAC):** Distinct dashboards for **Admins** (Full Access) and **Patients** (Limited Portal).
-   **JWT Handling:** Secure token storage with automatic expiration checks to auto-logout users.
-   **Form Validation** Form Validation via zod on each resource
-   **Route Guards:** Protected routes prevent unauthorized access to sensitive pages.

### 🏥 Clinic Management (CRUD)
-   **Doctors & Patients:** Full directory management with search and filtering.
-   **Appointments:** Interactive scheduling with conflict detection.
-   **Medical Records:** Comprehensive management of **Diagnoses** and **Prescriptions**.
-   **Cascade Deletion:** Advanced logic ensures data integrity. Deleting a Doctor/Patient automatically cleans up their linked Appointments and Prescriptions.

### 📊 Visualization & UX
-   **Interactive Calendar:** Drag-and-drop appointment rescheduling.
-   **Data Dashboard:** Real-time Recharts (Bar & Pie) visualizing clinic stats.
-   **Dark Mode:** Fully responsive theme toggle persisted in local storage.
-   **Dynamic Breadcrumbs:** Context-aware navigation trails.
-   **Animations:** Smooth page transitions and staggered list loading using Framer Motion.

---

## 🛠️ Technology Stack

*   **Core:** React 18, Vite
*   **Styling:** Tailwind CSS, ShadCN UI, Framer Motion
*   **State Management:** React Context API (Auth & Breadcrumbs)
*   **Data Fetching:** Axios (with Interceptors)
*   **Tools:** Recharts, React Big Calendar, Lucide Icons, Date-fns, Sonner (Toast)
*   **Deployment:** Firebase Hosting

---



### Admin Dashboard (Dark Mode)
![Dashboard]

### Interactive Schedule
![Calendar]

### Patient Profile (Master-Detail View)
![Profile]

---

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AdamPandey/ca2-medic-clinic.git
    cd ca2-medic-clinic
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## 📝 Author
**Adarsh Pandey**  
Creative Computing - Year 3  
CA2 - Front-End Development