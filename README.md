# College Management System

A full-stack College Management System built with **HTML, CSS, JavaScript, Node.js, Express, and MySQL**.

## 🚀 Unified Application

This project now features a **single unified application** that automatically routes users to their appropriate dashboards based on their role.

### Quick Start for Hackathon Judges

1. **Start the server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Open the application:**
   - Visit: `http://localhost:5000`
   - Use demo credentials below

3. **Demo Credentials:**
   - **Admin:** admin@college.edu / admin123
   - **Faculty:** faculty@college.edu / faculty123
   - **Student:** Use roll number as username / password

## Project Structure

```
college-management-system/
├── index.html                    # Unified landing page & login
├── register.html                 # Student registration
├── css/
│   └── unified.css              # Unified styles for all dashboards
├── js/
│   └── unified.js               # Unified JavaScript utilities
├── dashboards/
│   ├── admin-dashboard.html     # Admin dashboard
│   ├── admin-dashboard.js       # Admin dashboard logic
│   ├── faculty-dashboard.html   # Faculty dashboard
│   ├── faculty-dashboard.js     # Faculty dashboard logic
│   ├── student-dashboard.html   # Student dashboard
│   └── student-dashboard.js     # Student dashboard logic
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── faculty.js
│   │   ├── attendance.js
│   │   ├── results.js
│   │   ├── fees.js
│   │   ├── notifications.js
│   │   ├── timetable.js
│   │   └── dashboard.js
│   ├── uploads/
│   ├── database.sql
│   ├── package.json
│   └── server.js
└── README.md
```

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (mysql2/promise)
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer
- **Charts:** Chart.js
- **PDF:** jsPDF

## Setup Instructions

### 1. Create MySQL Database
Open **phpMyAdmin** (or MySQL CLI) and import:
```sql
source backend/database.sql;
```
Or copy-paste the contents of `backend/database.sql` into phpMyAdmin SQL tab.

This creates:
- Database: `college_management`
- Tables: `admins`, `students`, `faculty`, `attendance`, `results`, `fees`, `notifications`, `notification_recipients`, `timetable`
- Default admin: `admin@college.edu` / `admin123`

### 2. Configure Environment
Edit `backend/.env` if your MySQL credentials differ:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=college_management
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Start the Server
```bash
npm start
```
Server runs on `http://localhost:5000`

### 5. Access the Unified Application
- **Main Application:** Open `http://localhost:5000` in browser
- **Demo Credentials:**
  - **Admin:** admin@college.edu / admin123
  - **Faculty:** faculty@college.edu / faculty123
  - **Student:** Use roll number as username / password

The application automatically detects user roles and routes them to appropriate dashboards!

### Student Portal
- Modern landing page with hero, features, about, contact
- Student registration with file upload (profile photo)
- Secure login with JWT
- Dashboard overview cards (attendance, SGPA, fees, notifications)
- Profile management with editable fields
- Subject-wise attendance with progress bars and low-attendance alerts
- Semester-wise results with SGPA/CGPA auto-calculation
- Fee status with paid/unpaid/partial cards
- Class timetable viewer
- Real-time notifications with mark-as-read
- Help & Support with FAQ and contact form
- Dark / Light mode toggle
- Loading spinner on all API calls
- Fully responsive design

### Admin Dashboard
- Secure admin login
- Dashboard with statistics and Chart.js charts
- Student Management: Add, Edit, Delete, Search, Pagination
- Faculty Management: Add, Edit, Delete, Search
- Attendance Management: Mark subject-wise attendance per student per date
- Exam & Result Management: Add marks with automatic SGPA/CGPA calculation
- Fee Management: Add fee records, track payments, record partial payments
- Notification Center: Send notices to all or specific students
- Reports & Analytics tabs
- Dark / Light mode toggle
- Loading spinner on all API calls
- Fully responsive sidebar and tables

## Design System

### Colors
- Primary: `#4F46E5`
- Secondary: `#06B6D4`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Danger: `#EF4444`
- Sidebar: `#1E293B`
- Background (light): `#F8FAFC`
- Background (dark): `#0F172A`

### Fonts
- Poppins
- Inter
- Nunito

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/student/register` | POST | Student signup |
| `/api/auth/student/login` | POST | Student login |
| `/api/auth/student/profile` | GET/PUT | Student profile |
| `/api/auth/admin/login` | POST | Admin login |
| `/api/students` | GET/POST | List / Add students |
| `/api/students/:id` | GET/PUT/DELETE | Student CRUD |
| `/api/faculty` | GET/POST | List / Add faculty |
| `/api/faculty/:id` | GET/PUT/DELETE | Faculty CRUD |
| `/api/attendance/mark` | POST | Mark attendance |
| `/api/attendance/student` | GET | Student attendance |
| `/api/attendance/all` | GET | All attendance (admin) |
| `/api/results` | POST | Add/Update result |
| `/api/results/student` | GET | Student results |
| `/api/results/all` | GET | All results (admin) |
| `/api/fees` | POST | Add fee record |
| `/api/fees/:id/pay` | PUT | Record payment |
| `/api/fees/student` | GET | Student fees |
| `/api/fees/all` | GET | All fees (admin) |
| `/api/notifications` | POST | Send notification |
| `/api/notifications/student` | GET | Student notifications |
| `/api/notifications/all` | GET | All notifications (admin) |
| `/api/timetable` | POST | Create timetable |
| `/api/timetable/student` | GET | Student timetable |
| `/api/dashboard/stats` | GET | Dashboard stats |
| `/api/upload` | POST | File upload |

## Notes for First-Year Students

- Clean folder structure that is easy to explain
- Every backend route uses raw SQL with the `mysql2/promise` library
- Passwords are hashed with `bcryptjs`
- Authentication uses JWT tokens stored in `localStorage`
- The project works as a real-world ERP system while being beginner-friendly
- Perfect for hackathons, mini projects, and college presentations

## License

MIT
