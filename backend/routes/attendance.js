const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { studentAuth, adminAuth, facultyAuth, staffAuth } = require('../middleware/auth');

// Mark attendance (Admin or Faculty)
router.post('/mark', staffAuth, async (req, res) => {
  try {
    const { records } = req.body;
    const values = records.map(r => [r.student, r.subject, r.date, r.status, req.user.id]);
    await query('INSERT INTO attendance (student_id, subject, date, status, marked_by) VALUES ?', [values]);
    res.status(201).json({ message: 'Attendance marked successfully', count: records.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get student attendance
router.get('/student', studentAuth, async (req, res) => {
  try {
    const { subject } = req.query;
    let sql = 'SELECT * FROM attendance WHERE student_id = ?';
    const params = [req.user.id];
    if (subject) { sql += ' AND subject = ?'; params.push(subject); }
    sql += ' ORDER BY date DESC';
    const attendance = await query(sql, params);

    const summaryRows = await query('SELECT subject, COUNT(*) as total, SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present FROM attendance WHERE student_id = ? GROUP BY subject', [req.user.id]);
    const summary = summaryRows.map(s => ({
      subject: s.subject, totalClasses: s.total, present: s.present, absent: s.total - s.present,
      percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : 0
    }));
    res.json({ attendance, summary });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get all attendance for admin/faculty
router.get('/all', staffAuth, async (req, res) => {
  try {
    const { student, subject, date } = req.query;
    let sql = 'SELECT a.*, s.name as student_name, s.roll_number FROM attendance a JOIN students s ON a.student_id = s.id WHERE 1=1';
    const params = [];
    if (student) { sql += ' AND a.student_id = ?'; params.push(student); }
    if (subject) { sql += ' AND a.subject = ?'; params.push(subject); }
    if (date) { sql += ' AND a.date = ?'; params.push(date); }
    sql += ' ORDER BY a.date DESC LIMIT 200';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
