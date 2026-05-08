# 🎓 College Management System

A comprehensive, modular College Management System built with clean separation of concerns. Features dedicated portals for **Students**, **Faculty**, and **Administrators** with a powerful backend API.

---

## 📋 Project Structure

```
college-management-system/
├── 📄 index.html                 # Landing page
├── 📄 student.html               # Student portal
├── 📄 admin.html                 # Admin dashboard
├── 📄 faculty.html               # Faculty dashboard
├── 📁 css/
│   ├── student.css               # Student styles
│   ├── admin.css                 # Admin styles
│   ├── faculty.css               # Faculty styles
│   └── unified.css               # Shared styles
├── 📁 js/
│   ├── student.js                # Student functionality
│   ├── admin.js                  # Admin functionality
│   ├── faculty.js                # Faculty functionality
│   └── unified.js                # Shared utilities
├── 📁 backend/
│   ├── server.js                 # Express server
│   ├── package.json              # Dependencies
│   ├── database.sql              # Database schema
│   ├── config/
│   │   └── db.js                 # Database config
│   ├── middleware/
│   │   └── auth.js               # Authentication
│   └── routes/
│       ├── auth.js               # Auth endpoints
│       ├── students.js           # Student routes
│       ├── faculty.js            # Faculty routes
│       ├── attendance.js         # Attendance routes
│       ├── results.js            # Results routes
│       ├── fees.js               # Fees routes
│       ├── timetable.js          # Timetable routes
│       └── notifications.js      # Notifications routes
├── 📁 dashboards/                # Legacy dashboard files
├── 📁 student-portal/            # Legacy student files
├── 📁 admin-dashboard/           # Legacy admin files
├── 📁 faculty-dashboard/         # Legacy faculty files
└── README.md                      # Documentation
```

---

## ✨ Features

### 👨‍🎓 **Student Portal** (`student.html`)
- 📚 View attendance records with percentage tracking
- 📊 Check semester-wise results and CGPA
- 💰 Track fee payments and due dates
- 📅 Access class timetable
- 🔔 Receive important notifications
- 🎨 Dark/Light theme toggle

### 👨‍💼 **Admin Dashboard** (`admin.html`)
- 👥 Manage students and faculty members
- 📈 View system statistics and analytics
- 💳 Monitor fee collections and pending payments
- 📋 Manage attendance records
- 📊 Handle results management
- 🔔 Send notifications to users

### 👨‍🏫 **Faculty Dashboard** (`faculty.html`)
- 📚 Manage assigned classes and subjects
- ✅ Mark attendance for students
- 📝 Enter and publish student results
- 📅 View class schedule
- 🔔 Receive administrative notifications
- 📊 Track student performance

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14+)
- **MySQL/MariaDB** (v5.7+)
- **Git**
- Modern web browser

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/college-management-system.git
cd college-management-system
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

#### 3. Configure Database
Update `backend/config/db.js` with your database credentials:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'college_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

#### 4. Initialize Database
```bash
mysql -u root -p < backend/database.sql
```

#### 5. Start Backend Server
```bash
npm start
# Server runs on http://localhost:5000
```

#### 6. Start Frontend
Simply open `student.html`, `admin.html`, or `faculty.html` in your browser or use a local server:
```bash
npx http-server
```

---

## 📝 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Faculty | faculty@college.edu | faculty123 |
| Student | CS001 | password123 |

---

## 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** for authentication:

1. User submits credentials
2. Backend validates and generates token
3. Token stored in `localStorage`
4. Token included in API requests via `Authorization: Bearer <token>` header
5. Backend validates token for protected routes

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (with CSS variables for theming)
- **JavaScript (Vanilla)** - No framework dependencies
- **Font Awesome 6.5** - Icons
- **Google Fonts** - Typography

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### API
- **REST API** - Standard HTTP methods
- **JSON** - Data format
- **CORS** - Cross-origin requests

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/student/login   - Student login
POST   /api/auth/faculty/login   - Faculty login
POST   /api/auth/admin/login     - Admin login
POST   /api/auth/student/register - Student registration
```

### Student Routes
```
GET    /api/attendance/student    - Get student attendance
GET    /api/results/student       - Get student results
GET    /api/fees/student          - Get fee status
GET    /api/timetable/student     - Get class timetable
GET    /api/notifications/student - Get notifications
```

### Admin Routes
```
GET    /api/admin/stats           - System statistics
GET    /api/admin/students        - List all students
GET    /api/admin/faculty         - List all faculty
POST   /api/admin/students        - Add new student
PUT    /api/admin/students/:id    - Update student
DELETE /api/admin/students/:id    - Delete student
```

### Faculty Routes
```
GET    /api/faculty/classes       - Get assigned classes
GET    /api/faculty/students      - Get class students
POST   /api/attendance/mark       - Mark attendance
POST   /api/results/post          - Post results
```

---

## 🎨 Theming

The application supports **Dark** and **Light** themes. Themes use CSS variables:

```css
:root {
  --primary: #4F46E5;
  --secondary: #06B6D4;
  --bg: #F8FAFC;
  --card: #ffffff;
  --text: #1E293B;
  --text-light: #64748B;
}

[data-theme="dark"] {
  --bg: #0F172A;
  --card: #1E293B;
  --text: #F1F5F9;
  --text-light: #94A3B8;
}
```

---

## 📱 Responsive Design

The application is **fully responsive** and works on:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🤝 Using GitHub for Team Collaboration

### 1. **Create Repository**
```bash
# Initialize local repository
git init

# Add remote (on GitHub: Settings > Developer settings > Personal access token)
git remote add origin https://github.com/yourusername/college-management-system.git

# Create initial commit
git add .
git commit -m "Initial commit: College Management System"

# Push to GitHub
git push -u origin main
```

### 2. **Team Setup**
- **Owner** creates repository on GitHub
- **Team members** clone the repository
- **Collaborators** added via Repository Settings > Collaborators

### 3. **Feature Branch Workflow**
```bash
# Create feature branch
git checkout -b feature/student-portal

# Work on feature
git add .
git commit -m "feat: Add student attendance feature"

# Push branch to GitHub
git push origin feature/student-portal

# Create Pull Request on GitHub
# - Go to repository
# - Click "Compare & pull request"
# - Add description
# - Request review from team members
```

### 4. **Code Review Process**
- Team member reviews PR
- Suggests changes if needed
- Approves PR
- PR merged to `main` branch

```bash
# After merge, pull latest
git checkout main
git pull origin main
```

### 5. **Commit Best Practices**
```bash
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test

git commit -m "feat(student): add attendance tracking"
git commit -m "fix(auth): resolve JWT token validation"
git commit -m "docs(readme): update installation steps"
git commit -m "style(admin): improve dashboard layout"
```

### 6. **GitHub Project Management**
- Use **Issues** to track bugs and features
  - Label: bug, feature, documentation, help-wanted
  - Assign to team members
  - Link to PRs and projects
  
- Use **Projects** (Kanban board)
  - Organize tasks by status: To Do, In Progress, Done
  - Track sprint progress
  - Plan releases

- Use **Discussions** for team communication
  - Q&A sections
  - Show and tell
  - General discussions

- Use **Wikis** for documentation
  - Setup guides
  - Architecture diagrams
  - Team guidelines

### 7. **Important Files for GitHub**

Create these files in your repository root:

**`.gitignore`** - Files to exclude from version control
```
node_modules/
.env
.DS_Store
*.log
*.sql
uploads/
```

**`CONTRIBUTING.md`** - How to contribute
```markdown
# Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style
- Use meaningful variable names
- Add comments for complex logic
- Follow the existing code structure
```

**`CODE_OF_CONDUCT.md`** - Community standards
```markdown
# Code of Conduct

## Our Pledge
We are committed to providing a welcoming and inspiring community for all.

## Our Standards
- Be respectful and inclusive
- Respect differing opinions
- Focus on constructive feedback
- Report unacceptable behavior
```

**`LICENSE`** - MIT License (example)
```
MIT License - see https://opensource.org/licenses/MIT
```

### 8. **Show Project on GitHub**
- Write comprehensive **README.md** ✅
- Add badges (build, coverage, license)
- Include **screenshots** in README
- Add **demo link** and live deployment URL
- Create **CHANGELOG.md** to track versions
- Use **GitHub Pages** for documentation site

```markdown
# Badges
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MySQL Version](https://img.shields.io/badge/mysql-%3E%3D5.7-blue)](https://www.mysql.com/)
```

### 9. **GitHub Actions (CI/CD)** - Optional Advanced Setup

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: npm test
      - name: Deploy to server
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: npm run deploy
```

### 10. **Development Workflow**

```
┌─────────────────────────────────────────────────┐
│ 1. Create Issue (feature/bug) on GitHub         │
├─────────────────────────────────────────────────┤
│ 2. Assign to team member                        │
├─────────────────────────────────────────────────┤
│ 3. Create branch: git checkout -b feature/X    │
├─────────────────────────────────────────────────┤
│ 4. Implement feature locally                    │
├─────────────────────────────────────────────────┤
│ 5. Commit: git commit -m "feat: X"              │
├─────────────────────────────────────────────────┤
│ 6. Push: git push origin feature/X              │
├─────────────────────────────────────────────────┤
│ 7. Create Pull Request on GitHub                │
├─────────────────────────────────────────────────┤
│ 8. Code review by team                          │
├─────────────────────────────────────────────────┤
│ 9. Merge to main after approval                 │
├─────────────────────────────────────────────────┤
│ 10. Deploy to production                        │
└─────────────────────────────────────────────────┘
```

---

## 📊 Recommended GitHub Settings

1. **Branch Protection**
   - Require pull request reviews before merging
   - Require status checks to pass
   - Require branches to be up to date

2. **Automated Checks**
   - Enable GitHub Actions
   - Enable branch auto-delete on PR merge
   - Require code reviews: 1 person minimum

3. **Collaboration**
   - Allow auto-merge on PRs
   - Dismiss stale PR approvals when new commits pushed
   - Require up-to-date branches before merging

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check backend CORS configuration |
| JWT token expired | Clear localStorage and login again |
| Database connection failed | Verify MySQL credentials and status |
| API 404 errors | Check endpoint URL and method |
| Styling issues | Clear browser cache (Ctrl+Shift+Del) |
| Git conflicts | Use VS Code merge conflicts resolver |

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Basics](https://jwt.io/introduction)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## 📄 License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ by the College Management System Team
- Icons provided by Font Awesome
- Fonts from Google Fonts

---

## 📞 Support

For issues or questions:
- Open an **Issue** on GitHub
- Contact: support@collegemanagement.com
- Join our **Discussions** forum

---

## 🔄 Version History

- **v1.0.0** (2025-05-08) - Modular redesign with separate portals
- **v0.9.0** (2025-04-15) - Beta testing phase
- **v0.1.0** (2025-01-01) - Project started

---

**Made with 💻 and ☕ by your development team**

