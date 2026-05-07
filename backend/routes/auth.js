const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/db');
const { studentAuth, adminAuth } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Student Registration
router.post('/student/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('rollNumber').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, email, password, rollNumber, phone, department, course, semester, batch, dob, gender, address, parentName, parentPhone } = req.body;
    const [existing] = await query('SELECT id FROM students WHERE email = ? OR roll_number = ?', [email, rollNumber]);
    if (existing) return res.status(400).json({ message: 'Student already exists with this email or roll number' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await query('INSERT INTO students (name, email, password, roll_number, phone, department, course, semester, batch, dob, gender, address, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashed, rollNumber, phone || '', department || '', course || '', semester || 1, batch || '', dob || null, gender || '', address || '', parentName || '', parentPhone || '']);
    const token = generateToken(result.insertId);
    res.status(201).json({ token, user: { id: result.insertId, name, email, rollNumber } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student Login
router.post('/student/login', [
  body('rollNumber').notEmpty().isLength({ max: 10 }),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { rollNumber, password } = req.body;
    const rows = await query('SELECT * FROM students WHERE roll_number = ?', [rollNumber]);
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    const student = rows[0];
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(student.id);
    res.json({ token, user: { id: student.id, name: student.name, email: student.email, rollNumber: student.roll_number, profilePhoto: student.profile_photo } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Student Profile
router.get('/student/profile', studentAuth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Student Profile
router.put('/student/profile', studentAuth, async (req, res) => {
  try {
    const { name, phone, department, course, semester, batch, parentName, parentPhone, address } = req.body;
    await query('UPDATE students SET name = ?, phone = ?, department = ?, course = ?, semester = ?, batch = ?, parent_name = ?, parent_phone = ?, address = ? WHERE id = ?',
      [name, phone, department, course, semester, batch, parentName, parentPhone, address, req.user.id]);
    const rows = await query('SELECT id, name, email, roll_number, phone, department, course, semester, batch, profile_photo, parent_name, parent_phone, address, status FROM students WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Login
router.post('/admin/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { email, password } = req.body;
    const rows = await query('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    await query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
    const token = generateToken(admin.id);
    res.json({ token, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty Login
router.post('/faculty/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { email, password } = req.body;
    const rows = await query('SELECT * FROM faculty WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    const faculty = rows[0];
    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(faculty.id);
    res.json({ token, user: { id: faculty.id, name: faculty.name, email: faculty.email, employeeId: faculty.employee_id, department: faculty.department, designation: faculty.designation, profilePhoto: faculty.profile_photo } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty Profile
router.get('/faculty/profile', async (req, res, next) => {
  const { facultyAuth } = require('../middleware/auth');
  facultyAuth(req, res, async () => {
    try { res.json(req.user); } catch (error) { res.status(500).json({ message: error.message }); }
  });
});

// Admin Profile
router.get('/admin/profile', adminAuth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
