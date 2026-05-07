const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { adminAuth, staffAuth } = require('../middleware/auth');

router.get('/', staffAuth, async (req, res) => {
  try {
    const { search, department, status, course, page = 1, limit = 20 } = req.query;
    let sql = 'SELECT id, roll_number, name, email, phone, department, course, semester, status, created_at FROM students WHERE 1=1';
    const params = [];
    if (search) { sql += ' AND (name LIKE ? OR email LIKE ? OR roll_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (department) { sql += ' AND department = ?'; params.push(department); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (course) { sql += ' AND course = ?'; params.push(course); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    const rows = await query(sql, params);
    const [countRow] = await query('SELECT COUNT(*) as total FROM students WHERE 1=1', []);
    res.json({ students: rows, total: countRow.total });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', adminAuth, async (req, res) => {
  try {
    const rows = await query('SELECT id, roll_number, name, email, phone, gender, dob, department, course, semester, batch, address, profile_photo, parent_name, parent_phone, status, created_at FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, email, password, rollNumber, phone, department, course, semester, batch, dob, gender, address, parentName, parentPhone, status } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await query('INSERT INTO students (name, email, password, roll_number, phone, department, course, semester, batch, dob, gender, address, parent_name, parent_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashed, rollNumber, phone, department, course, semester || 1, batch, dob, gender, address, parentName, parentPhone, status || 'active']);
    const rows = await query('SELECT id, roll_number, name, email, department, course, status FROM students WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, rollNumber, phone, department, course, semester, batch, dob, gender, address, parentName, parentPhone, status } = req.body;
    await query('UPDATE students SET name = ?, email = ?, roll_number = ?, phone = ?, department = ?, course = ?, semester = ?, batch = ?, dob = ?, gender = ?, address = ?, parent_name = ?, parent_phone = ?, status = ? WHERE id = ?',
      [name, email, rollNumber, phone, department, course, semester, batch, dob, gender, address, parentName, parentPhone, status, req.params.id]);
    const rows = await query('SELECT id, roll_number, name, email, department, course, status FROM students WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
