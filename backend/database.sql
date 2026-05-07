-- College Management System Database Schema (MySQL)
-- Run this script in phpMyAdmin or MySQL CLI to create the database and tables

CREATE DATABASE IF NOT EXISTS college_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE college_management;

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin','admin') DEFAULT 'admin',
  profile_photo VARCHAR(255) DEFAULT '',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll_number VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gender ENUM('Male','Female','Other'),
  dob DATE,
  department VARCHAR(50),
  course VARCHAR(50),
  semester INT DEFAULT 1,
  batch VARCHAR(20),
  address TEXT,
  profile_photo VARCHAR(255) DEFAULT '',
  parent_name VARCHAR(100),
  parent_phone VARCHAR(20),
  status ENUM('active','inactive','graduated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(50),
  designation VARCHAR(50),
  qualification VARCHAR(100),
  joining_date DATE,
  salary DECIMAL(10,2),
  profile_photo VARCHAR(255) DEFAULT '',
  address TEXT,
  gender ENUM('Male','Female','Other'),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  status ENUM('present','absent') NOT NULL,
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Results / Exams table
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester INT NOT NULL,
  exam_type ENUM('midterm','final','internal') NOT NULL,
  subjects JSON NOT NULL,
  sgpa DECIMAL(4,2),
  cgpa DECIMAL(4,2),
  total_marks INT,
  percentage DECIMAL(5,2),
  result ENUM('pass','fail','reappear') DEFAULT 'pass',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Fees table
CREATE TABLE IF NOT EXISTS fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  fee_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_amount DECIMAL(10,2) DEFAULT 0,
  semester INT NOT NULL,
  due_date DATE,
  paid_date DATE,
  status ENUM('paid','pending','partial') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  receipt_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('notice','exam','fee','attendance','emergency') DEFAULT 'notice',
  send_to_all BOOLEAN DEFAULT FALSE,
  sent_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sent_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Notification recipients (many-to-many)
CREATE TABLE IF NOT EXISTS notification_recipients (
  notification_id INT NOT NULL,
  student_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (notification_id, student_id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course VARCHAR(50) NOT NULL,
  semester INT NOT NULL,
  department VARCHAR(50),
  schedule JSON NOT NULL,
  valid_from DATE,
  valid_till DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
-- Password is bcrypt hash of 'admin123'
INSERT IGNORE INTO admins (name, email, password, role) VALUES 
('Super Admin', 'admin@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');

-- Insert default faculty (password: faculty123)
-- Password is bcrypt hash of 'faculty123'
INSERT IGNORE INTO faculty (name, email, password, employee_id, department, designation, status) VALUES 
('Dr. John Smith', 'faculty@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FAC001', 'Computer Science', 'Assistant Professor', 'active');
