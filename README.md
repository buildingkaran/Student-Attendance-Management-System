# 🎓 Student Attendance Management System

### DSC: Full Stack Web Development – II (Semester V)
**Department of Vocation • B.Voc (Software Development)**  
**Academic Submission — Capstone Project & Assignment**

---

## 👨‍🎓 Student & Academic Information

| Field | Details |
| :--- | :--- |
| **Student Name** | **Karan Kumar** |
| **College Roll Number** | **24107030** |
| **Exam Roll Number** | **24020107011** |
| **Course & Semester** | **B.Voc (Software Development) — Semester V** |
| **Course Title** | **DSC: Full Stack Web Development – II** |
| **Submission Title** | **Student Attendance Management System** |

---

## 📋 Table of Contents

1. [Executive Summary & Case Study](#1-executive-summary--case-study)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture & Directory Layout](#3-system-architecture--directory-layout)
4. [Assignment Technical Solutions (Q1 - Q5)](#4-assignment-technical-solutions-q1---q5)
   - [Q1: Node.js & Express.js Routing Design](#q1-nodejs--expressjs-web-server-and-routing-design)
   - [Q2: MongoDB Modeling, Querying & Aggregation](#q2-mongodb-data-modeling-querying-and-updating)
   - [Q3: File System (fs) Audit Logging & Yargs CLI](#q3-file-system-fs-audit-logging--yargs-cli-processing)
   - [Q4: Git, Jenkins & Maven Build Management](#q4-source-code-automated-testing-and-build-management-git-jenkins--maven)
   - [Q5: Containerization & Port Forwarding with Docker](#q5-containerization-and-deployment-with-docker)
5. [Setup & Execution Instructions](#5-setup--execution-instructions)
6. [Yargs CLI Usage & Examples](#6-yargs-cli-usage--examples)
7. [REST API Documentation](#7-rest-api-documentation)
8. [Automated Testing (`npm test`)](#8-automated-testing)
9. [Project Limitations & Future Enhancements](#9-project-limitations--future-enhancements)

---

## 1. Executive Summary & Case Study

The **Student Attendance Management System** is a full-stack, enterprise-grade web application developed for university faculty, administrators, and students. The application solves common academic attendance challenges:

- **Faculty Members:** Can select subjects, choose students from directory rosters, and mark daily attendance as `Present` or `Absent`.
- **Duplicate Prevention:** The backend actively blocks duplicate attendance entries for the same student in the same subject on the same date.
- **UGC 75% Attendance Eligibility Rule:** Automatically aggregates attended vs. total classes and calculates exact attendance percentages to flag exam eligibility (`Eligible` $\ge 75\%$, `Shortage` $< 75\%$).
- **Dual Persistence Architecture:** Seamlessly connects to **MongoDB Atlas** using Mongoose, while providing a resilient fallback persistent store (`data/local_db.json`) ensuring that the application works out-of-the-box in offline examination environments.
- **Sequential File System Audit Trail:** Every attendance operation is asynchronously appended to a plain-text audit file (`logs/attendance.log`) using the Node.js `fs` module.
- **Terminal CLI Support:** Built with **Yargs** to enable faculty and sysadmins to mark attendance, register students, and generate terminal reports without opening a browser.
- **DevOps Ready:** Fully containerized with **Docker** and **Docker Compose** (port forwarding `8080:3000`), version-controlled with **Git**, and automated via a declarative **Jenkinsfile** CI/CD pipeline.

---

## 2. Technology Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive single-page dashboard with academic blue and white theme, cards, tables, SVG icons, and modal dialogs. **No React or Angular used.** |
| **Backend** | Node.js (v20+ / v26+), Express.js | Modular REST API with MVC structure, JSON body parsing, CORS support, and centralized error handling middleware. |
| **Database** | MongoDB Atlas, Mongoose ODM | Referenced document collections, compound unique indexes, and MongoDB Aggregation Pipelines. |
| **File System** | Node.js `fs` module | Asynchronous audit logging with `fs.appendFile()` to `logs/attendance.log`. |
| **CLI Engine** | Yargs | Structured command-line argument parsing for terminal operations (`mark`, `add-student`, `stats`, `logs`). |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`) | 7 integration tests verifying API endpoints, duplicate rejection, and audit logging. |
| **DevOps & CI/CD** | Git, GitHub, Docker, Docker Compose, Jenkins | Lightweight Alpine-based containerization, host port forwarding (8080:3000), and declarative CI automation. |

---

## 3. System Architecture & Directory Layout

```
FSWD2Assignment/
├── config/
│   └── db.js                 # MongoDB Atlas connection via Mongoose + connection state detection
├── controllers/
│   ├── studentController.js   # Student CRUD, validation, and search
│   ├── facultyController.js   # Faculty directory management
│   ├── attendanceController.js# Attendance marking, duplicate check, percentages & fs logging
│   └── dashboardController.js # Aggregated metrics (totals, attendance %, database status)
├── models/
│   ├── Student.js             # Mongoose schema for Student records
│   ├── Faculty.js             # Mongoose schema for Faculty records
│   └── Attendance.js          # Mongoose schema with compound unique index { studentRollNo, subject, date }
├── routes/
│   ├── studentRoutes.js       # /api/students endpoints
│   ├── facultyRoutes.js       # /api/faculty endpoints
│   ├── attendanceRoutes.js    # /api/attendance endpoints
│   └── dashboardRoutes.js     # /api/dashboard endpoints
├── middleware/
│   └── errorHandler.js        # Centralized Express JSON error handler
├── utils/
│   ├── logger.js              # Node.js fs module audit logging -> logs/attendance.log
│   └── storage.js             # Unified data service (MongoDB Mongoose + persistent fallback)
├── logs/
│   ├── .gitkeep
│   └── attendance.log         # Server disk sequential plain-text audit trail
├── data/
│   └── local_db.json          # Seeded local data store for offline demo mode
├── public/
│   ├── index.html             # Single-Page University Attendance Dashboard
│   ├── css/
│   │   └── styles.css         # Academic blue & white theme, responsive grid, modal & toast styles
│   └── js/
│       └── app.js             # Vanilla JS client logic (API calls, modal controllers, filters)
├── test/
│   └── api.test.js            # Automated integration test suite (node:test)
├── cli.js                     # Yargs Command-Line Interface utility
├── server.js                  # Main Express web server entry point
├── Dockerfile                 # Multi-stage lightweight node:20-alpine Docker blueprint
├── docker-compose.yml         # Container orchestration with port mapping 8080:3000
├── Jenkinsfile                # Declarative Jenkins CI/CD pipeline
├── package.json               # Dependencies and npm scripts
├── .env.example               # Template environment configuration
├── .env                       # Local environment file
├── .dockerignore              # Docker build exclusions
├── .gitignore                 # Git ignore rules
└── README.md                  # Comprehensive project documentation
```

---

## 4. Assignment Technical Solutions (Q1 - Q5)

### Q1. Node.js & Express.js Web Server and Routing Design

Node.js offers an asynchronous, event-driven JavaScript runtime executing on Google Chrome's V8 engine. Express.js sits on top of Node.js to provide a minimalist routing framework.

#### 1.1 Server Initialization & Middleware Stack (`server.js`)
- `express.json()`: Parses incoming HTTP request payloads formatted as JSON.
- `express.urlencoded({ extended: true })`: Parses URL-encoded form submissions.
- `cors()`: Cross-Origin Resource Sharing middleware allowing cross-domain communication.
- `express.static('public')`: Serves frontend assets directly.
- `errorHandler`: Global catch-all middleware intercepting unhandled errors and formatting clean JSON error responses.

#### 1.2 Core Routing Architecture
```javascript
// server.js routing delegation
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
```

---

### Q2. MongoDB Data Modeling, Querying, and Updating

MongoDB is a document-oriented NoSQL database where records are represented as BSON documents.

#### 2.1 Mongoose Schemas (`models/`)
1. **Student Schema (`models/Student.js`):**
   ```javascript
   const studentSchema = new mongoose.Schema({
     rollNo: { type: String, required: true, unique: true, trim: true },
     name: { type: String, required: true, trim: true },
     course: { type: String, required: true, trim: true },
     semester: { type: Number, required: true, min: 1, max: 8 },
     email: { type: String, required: true, trim: true, lowercase: true }
   }, { timestamps: true });
   ```
2. **Attendance Schema (`models/Attendance.js`):**
   ```javascript
   const attendanceSchema = new mongoose.Schema({
     studentRollNo: { type: String, required: true, ref: 'Student' },
     studentName: { type: String, required: true },
     subject: { type: String, required: true, trim: true },
     date: { type: String, required: true }, // Format: YYYY-MM-DD
     status: { type: String, required: true, enum: ['Present', 'Absent'] },
     markedBy: { type: String, default: 'FAC101' }
   }, { timestamps: true });

   // Compound Unique Index: Prevents duplicate attendance for same student, subject and date
   attendanceSchema.index({ studentRollNo: 1, subject: 1, date: 1 }, { unique: true });
   ```

#### 2.2 Aggregation Pipeline for Percentage Calculation
To determine total and attended lectures directly inside MongoDB:
```javascript
const aggregationResults = await Attendance.aggregate([
  {
    $group: {
      _id: '$studentRollNo',
      totalClasses: { $sum: 1 },
      presentClasses: {
        $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
      },
      absentClasses: {
        $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
      }
    }
  }
]);
```

$$\text{Attendance Percentage} = \left( \frac{\text{presentClasses}}{\text{totalClasses}} \right) \times 100$$

---

### Q3. File System (fs) Audit Logging & Yargs CLI Processing

#### 3.1 Node.js File System (`fs`) Audit Logging (`utils/logger.js`)
To provide an immutable, human-readable audit trail that functions independently of the database, the Node.js built-in `fs` module is utilized. Whenever attendance is recorded (via frontend form, REST API, or CLI), an asynchronous `fs.appendFile()` operation writes an entry to `logs/attendance.log`.

```javascript
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '..', 'logs', 'attendance.log');

function logAttendance({ rollNo, studentName, subject, date, status, markedBy }) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ROLL: ${rollNo} | NAME: ${studentName} | SUBJECT: ${subject} | DATE: ${date} | STATUS: ${status} | MARKED_BY: ${markedBy}\n`;

  fs.appendFile(logFilePath, logEntry, 'utf8', (err) => {
    if (err) console.error('Failed to append log:', err);
  });
}
```

#### 3.2 Command-Line Processing with Yargs (`cli.js`)
**Yargs** is a robust argument-parsing library for Node.js. It converts terminal arguments (`process.argv`) into structured objects.

Implemented commands:
- `mark`: Marks student attendance with arguments `--roll`, `--subject`, `--status`, `--date`, `--markedBy`.
- `add-student`: Registers a student with `--roll`, `--name`, `--course`, `--semester`, `--email`.
- `stats`: Generates overall or student-specific formatted attendance reports.
- `list-students`: Displays an enrolled students directory in a tabular terminal view.
- `logs`: Views recent lines from `logs/attendance.log`.

---

### Q4. Source Code, Automated Testing, and Build Management (Git, Jenkins & Maven)

#### 4.1 Git & GitHub
- **Git** serves as the distributed Version Control System (VCS).
- Feature branching: Feature development occurs on branches (e.g., `feature/attendance-api`, `feature/ui-dashboard`) before merging into `main`.
- `.gitignore` ensures that sensitive files (`.env`), transient build artifacts, and bulky `node_modules/` are excluded.

#### 4.2 Jenkins Automated CI/CD Pipeline (`Jenkinsfile`)
A declarative pipeline automates build, test, and container packaging on every Git commit:
1. **Stage 1 (Checkout SCM):** Fetches the latest repository commit.
2. **Stage 2 (Install Dependencies):** Executes `npm ci` for deterministic package resolution.
3. **Stage 3 (Automated Testing):** Executes `npm test` running the 7 integration tests in `test/api.test.js`.
4. **Stage 4 (Security Audit):** Checks for critical dependency vulnerabilities using `npm audit`.
5. **Stage 5 (Docker Build):** Packages the application into an image tagged with the Jenkins build number (`university-attendance-app:${BUILD_NUMBER}`).
6. **Stage 6 (Deployment Verification):** Verifies image readiness for host port binding (8080:3000).

#### 4.3 Maven: Detailed Explanation and Applicability to Node.js

##### What is Apache Maven?
**Apache Maven** is a comprehensive software project management and comprehension tool primarily designed for **Java-based applications**. Maven relies on the concept of a **Project Object Model (POM)** described in an XML file (`pom.xml`). It standardizes:
1. **Build Lifecycle:** Standard phases such as `validate`, `compile`, `test`, `package`, `verify`, `install`, and `deploy`.
2. **Dependency Management:** Centralized dependency coordinates (`groupId`, `artifactId`, `version`) retrieved automatically from Maven Central.
3. **Plugins & Reporting:** Extensible plugins (e.g., `maven-compiler-plugin`, `surefire-plugin` for JUnit testing).

##### Maven vs. npm (Node Package Manager)
| Aspect | Apache Maven (`pom.xml`) | npm (`package.json`) |
| :--- | :--- | :--- |
| **Primary Ecosystem** | Java / JVM (Spring Boot, Jakarta EE) | JavaScript / TypeScript / Node.js |
| **Configuration Format**| XML (`pom.xml`) | JSON (`package.json`) |
| **Repository System** | Maven Central / Sonatype Nexus | npm Registry (`registry.npmjs.org`) |
| **Build Lifecycle** | Explicit phases (`compile -> test -> package`) | Flexible scripts (`npm test`, `npm run build`) |
| **Runtime Target** | JVM Bytecode (`.class`, `.jar`, `.war`) | V8 JavaScript Engine (`.js`) |

##### Applicability of Maven to this Node.js Project
While a standalone Node.js and Express application relies directly on `npm` for packaging and execution, **Maven is highly applicable in real-world university enterprise architectures** in the following two key scenarios:

1. **Enterprise Multi-Module & Microservice Architectures:**
   In large university IT infrastructures, core systems (such as the Central Student Information System, Fee Payment Gateway, or LDAP/SSO Authentication) are commonly built in **Java (Spring Boot / Jakarta EE)** managed by Maven. If the Node.js Attendance Service is deployed as a satellite microservice within this university ecosystem, a root Maven parent POM orchestrates the entire build pipeline: compiling Java services, invoking the Node.js build, and packaging all microservices into uniform Docker containers.

2. **The `frontend-maven-plugin` Integration:**
   In enterprise Java environments where a Java backend serves or wraps a Node.js frontend/service, developers use the **`frontend-maven-plugin`** in the `pom.xml`. This plugin automatically:
   - Downloads a local, sandboxed Node.js and npm binary without requiring global system installation.
   - Executes `npm install` and `npm test` during the Maven `test` phase.
   - Packages the static files (`public/`) into a Java `.war` or Spring Boot executable `.jar` for deployment on enterprise application servers like Apache Tomcat or WildFly.

---

### Q5. Containerization and Deployment with Docker

Containerization encapsulates the application runtime, dependencies, and configuration into an isolated image, eliminating the "works on my machine" dilemma.

#### 5.1 Dockerfile (`Dockerfile`)
- Base image: `node:20-alpine` (ultra-lightweight Linux distribution, < 150 MB).
- Layer caching: `package*.json` is copied and installed before copying source code, ensuring that dependencies are re-used across builds unless packages change.
- Non-root user: Executes under the built-in `node` user to prevent privilege escalation vulnerabilities.
- Healthcheck: Verifies service responsiveness via `wget` against `/api/dashboard/stats`.

#### 5.2 Docker Compose & Port Forwarding (`docker-compose.yml`)
As required by **Assignment Question 5**, Docker port forwarding maps an external host port to the internal container port:

```yaml
ports:
  - "8080:3000"
```

- **Host Port `8080`:** The external port through which university students and faculty access the application (`http://localhost:8080`).
- **Container Port `3000`:** The internal port where Express listens.
- **Environment Variables:** `MONGODB_URI=${MONGODB_URI:-}` ensures database credentials are loaded securely from `.env` and **never hardcoded**.
- **Host Volumes:** Mounts `./logs:/usr/src/app/logs` so that plain-text audit logs created by the Node.js `fs` module survive container restarts.

```bash
# Build and run containerized application
docker-compose up -d --build

# Access the application
http://localhost:8080
```

---

## 5. Setup & Execution Instructions

### Prerequisites
- **Node.js** (v18.x, v20.x, or v26.x)
- **npm** (v9.x or higher)
- Optional: **Docker** and **Docker Compose**

### Step 1: Clone or Navigate to Project Directory
```bash
cd c:\Users\User\OneDrive\Desktop\FSWD2Assignment
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Open `.env` in any text editor. If you have a MongoDB Atlas connection string, paste it:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/attendance_db?retryWrites=true&w=majority
```

> **Note on Offline / Evaluation Mode:**  
> If `MONGODB_URI` is left blank, the application automatically activates **Local Persistence Fallback Mode** (`data/local_db.json`). All buttons, forms, tables, CLI commands, and audit logs remain **100% functional** even without an active MongoDB connection.

### Step 4: Start the Server
```bash
# Standard startup
npm start

# Development mode with auto-reload (Node.js 18+)
npm run dev
```

The console will display the server banner:
```
================================================================
🎓 STUDENT ATTENDANCE MANAGEMENT SYSTEM
📌 Course: B.Voc (Software Development) - Semester V
👨‍🎓 Student Name: Karan Kumar
🆔 College Roll No: 24107030 | Exam Roll No: 24020107011
----------------------------------------------------------------
🚀 Server successfully running on: http://localhost:3000
🌐 REST API Base URL:             http://localhost:3000/api
================================================================
```

### Step 5: Open the Application
Open any web browser and navigate to:
```
http://localhost:3000
```

---

## 6. Yargs CLI Usage & Examples

The CLI tool (`cli.js`) provides direct access to attendance operations via the command line.

### 1. View Overall Attendance Summary
```bash
node cli.js stats
```
*Output:*
```
========================================================================
📊 OVERALL UNIVERSITY ATTENDANCE SUMMARY
========================================================================
Total Students Registered : 5
Total Faculty Members     : 3
Total Attendance Records  : 8
Campus Attendance Rate    : 75%
------------------------------------------------------------------------
ROLL NO     NAME                TOTAL   PRESENT   PERCENT     STATUS
------------------------------------------------------------------------
24107030    Karan Kumar         4       4         100%        Eligible
24107031    Priya Sharma        2       1         50%         Shortage
24107032    Rahul Verma         1       0         0%          Shortage
24107033    Ananya Gupta        1       1         100%        Eligible
24107034    Amit Singh          0       0         0%          No Classes
========================================================================
```

### 2. View Individual Student Attendance Report
```bash
node cli.js stats --roll=24107030
```
*Generates student percentage, attended classes, absent count, and recent subject history.*

### 3. Mark Student Attendance
```bash
node cli.js mark --roll=24107030 --subject="FSWD-II" --status=Present --date=2026-11-15
```
*Appends the entry to `logs/attendance.log` using the Node.js `fs` module.*

### 4. Duplicate Prevention in CLI
If you run the exact same `mark` command twice on the same day:
```bash
node cli.js mark --roll=24107030 --subject="FSWD-II" --status=Present --date=2026-11-15
```
*Output:*
```
❌ Error: Duplicate Attendance: Attendance for student Karan Kumar (24107030) in subject "FSWD-II" on 2026-11-15 has already been marked as "Present".
```

### 5. Register a New Student via CLI
```bash
node cli.js add-student --roll="24107035" --name="Simran Kaur" --course="B.Voc Software Development" --semester=5 --email="simran.kaur@college.edu"
```

### 6. View Directory of Enrolled Students
```bash
node cli.js list-students
```

### 7. View Audit Logs from Server Disk
```bash
node cli.js logs --limit=10
```

---

## 7. REST API Documentation

### Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Retrieves total counts, overall percentage, recent entries, and DB status |
| `GET` | `/students` | Retrieves all students (supports `?search=query`) |
| `GET` | `/students/:rollNo` | Retrieves student profile by roll number |
| `POST` | `/students` | Registers new student (`rollNo`, `name`, `course`, `semester`, `email`) |
| `DELETE` | `/students/:idOrRoll`| Deletes student and cascaded attendance records |
| `GET` | `/faculty` | Retrieves all faculty members |
| `POST` | `/faculty` | Registers new faculty (`facultyId`, `name`, `department`, `email`) |
| `DELETE` | `/faculty/:id` | Deletes faculty member |
| `POST` | `/attendance` | Marks attendance (`studentRollNo`, `subject`, `date`, `status`, `markedBy`) |
| `GET` | `/attendance` | Retrieves attendance history (filters: `?rollNo=`, `?subject=`, `?date=`) |
| `GET` | `/attendance/summary`| Aggregates and calculates attendance percentages for all students |
| `GET` | `/attendance/student/:rollNo` | Detailed attendance report for a specific student |
| `DELETE` | `/attendance/:id` | Removes an attendance log entry |
| `GET` | `/attendance/logs` | Reads recent plain-text log lines from `logs/attendance.log` |

---

## 8. Automated Testing

The project incorporates an automated integration test suite located in `test/api.test.js` using Node.js's native test runner (`node:test`) and assertion library (`node:assert`).

Run the automated tests:
```bash
npm test
```

### Test Results
```
✔ 1. GET /api/dashboard/stats returns university dashboard counts and statistics (124ms)
✔ 2. GET /api/students returns list of students (9ms)
✔ 3. POST /api/students registers a new student with validation (55ms)
✔ 4. GET /api/faculty returns list of faculty members (11ms)
✔ 5. POST /api/attendance marks attendance and prevents duplicate entry (15ms)
✔ 6. GET /api/attendance/summary calculates student attendance percentages correctly (6ms)
✔ 7. GET /api/attendance/logs retrieves audit logs from Node.js fs module (6ms)

ℹ tests 7 | pass 7 | fail 0 | cancelled 0 | skipped 0
```

All 7 tests execute cleanly in under 2 seconds, guaranteeing zero-friction execution inside the Jenkins CI pipeline.

---

## 9. Project Limitations & Future Enhancements

### Current Project Limitations
1. **Authentication & Session Tokens:** The current system provides role separation across the UI and endpoints but does not enforce JWT (JSON Web Tokens) or password hashing (bcrypt) for user logins.
2. **Biometric & RFID Integration:** Attendance is marked manually through the portal or CLI rather than hardware readers (fingerprint scanners, RFID cards).
3. **Automated Parent Notifications:** Email notifications for low attendance are displayed on the dashboard rather than dispatched via SMTP (e.g., Nodemailer / SendGrid).

### Future Enhancements
1. **JWT & Role-Based Access Control (RBAC):** Restrict marking privileges exclusively to authenticated faculty accounts.
2. **Automated Low-Attendance Email Alerts:** Trigger automated email warnings when a student's attendance drops below the 75% threshold.
3. **Export to Excel / PDF:** Allow faculty to download monthly attendance sheets formatted as `.xlsx` or `.pdf` for university record keeping.

---

### Department of Vocation • B.Voc (Software Development)
*Full Stack Web Development – II (Semester V)*  
**Student:** Karan Kumar | **College Roll No:** 24107030 | **Exam Roll No:** 24020107011  
*Academic Year 2026*
