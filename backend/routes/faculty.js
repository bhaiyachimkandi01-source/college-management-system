const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const { search, department } = req.query;
    let sql = 'SELECT id, employee_id, name, email, phone, department, designation, status, created_at FROM faculty WHERE 1=1';
    const params = [];
    if (search) { sql += ' AND (name LIKE ? OR email LIKE ? OR employee_id LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (department) { sql += ' AND department = ?'; params.push(department); }
    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', adminAuth, async (req, res) => {
  try {
    const rows = await query('SELECT id, employee_id, name, email, phone, department, designation, qualification, joining_date, salary, profile_photo, address, gender, status, created_at FROM faculty WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Faculty not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, email, password, employeeId, phone, department, designation, qualification, joiningDate, salary, address, gender } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await query('INSERT INTO faculty (name, email, password, employee_id, phone, department, designation, qualification, joining_date, salary, address, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashed, employeeId, phone, department, designation, qualification, joiningDate, salary, address, gender]);
    const rows = await query('SELECT id, employee_id, name, email, department, designation, status FROM faculty WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, employeeId, phone, department, designation, qualification, joiningDate, salary, address, gender, status } = req.body;
    await query('UPDATE faculty SET name = ?, email = ?, employee_id = ?, phone = ?, department = ?, designation = ?, qualification = ?, joining_date = ?, salary = ?, address = ?, gender = ?, status = ? WHERE id = ?',
      [name, email, employeeId, phone, department, designation, qualification, joiningDate, salary, address, gender, status, req.params.id]);
    const rows = await query('SELECT id, employee_id, name, email, department, designation, status FROM faculty WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await query('DELETE FROM faculty WHERE id = ?', [req.params.id]);
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
