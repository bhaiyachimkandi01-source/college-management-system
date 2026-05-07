const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { studentAuth, adminAuth } = require('../middleware/auth');

router.post('/', adminAuth, async (req, res) => {
  try {
    const { course, semester, department, schedule, validFrom, validTill } = req.body;
    const existing = await query('SELECT id FROM timetable WHERE course = ? AND semester = ?', [course, semester]);
    let result;
    if (existing.length > 0) {
      await query('UPDATE timetable SET department = ?, schedule = ?, valid_from = ?, valid_till = ? WHERE id = ?',
        [department, JSON.stringify(schedule), validFrom, validTill, existing[0].id]);
      result = existing[0].id;
    } else {
      const insert = await query('INSERT INTO timetable (course, semester, department, schedule, valid_from, valid_till) VALUES (?, ?, ?, ?, ?, ?)',
        [course, semester, department, JSON.stringify(schedule), validFrom, validTill]);
      result = insert.insertId;
    }
    const rows = await query('SELECT * FROM timetable WHERE id = ?', [result]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/student', studentAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM timetable WHERE course = ? AND semester = ?', [req.user.course, req.user.semester]);
    if (rows.length === 0) return res.status(404).json({ message: 'Timetable not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM timetable ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
