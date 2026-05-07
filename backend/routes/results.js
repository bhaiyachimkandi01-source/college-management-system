const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { studentAuth, adminAuth, staffAuth } = require('../middleware/auth');

function calculateGrade(marks, maxMarks) {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return 'A+'; if (pct >= 80) return 'A'; if (pct >= 70) return 'B';
  if (pct >= 60) return 'C'; if (pct >= 50) return 'D'; return 'F';
}

function calculateSGPA(subjects) {
  const gp = { 'A+': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'F': 0 };
  const total = subjects.reduce((s, sub) => s + (gp[sub.grade] || 0), 0);
  return (total / subjects.length).toFixed(2);
}

// Add/Update result (Admin or Faculty)
router.post('/', staffAuth, async (req, res) => {
  try {
    const { student, semester, examType, subjects } = req.body;
    const marks = subjects.map(s => ({ ...s, grade: calculateGrade(s.marksObtained, s.maxMarks || 100) }));
    const totalMarks = marks.reduce((sum, s) => sum + s.marksObtained, 0);
    const maxTotal = marks.reduce((sum, s) => sum + (s.maxMarks || 100), 0);
    const percentage = ((totalMarks / maxTotal) * 100).toFixed(2);
    const sgpa = calculateSGPA(marks);
    const resultStatus = percentage >= 40 ? 'pass' : 'fail';

    const existing = await query('SELECT id FROM results WHERE student_id = ? AND semester = ? AND exam_type = ?', [student, semester, examType]);
    let resultId;
    if (existing.length > 0) {
      await query('UPDATE results SET subjects = ?, sgpa = ?, total_marks = ?, percentage = ?, result = ? WHERE id = ?',
        [JSON.stringify(marks), sgpa, totalMarks, percentage, resultStatus, existing[0].id]);
      resultId = existing[0].id;
    } else {
      const insert = await query('INSERT INTO results (student_id, semester, exam_type, subjects, sgpa, total_marks, percentage, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [student, semester, examType, JSON.stringify(marks), sgpa, totalMarks, percentage, resultStatus]);
      resultId = insert.insertId;
    }

    const allResults = await query('SELECT sgpa FROM results WHERE student_id = ?', [student]);
    const cgpa = (allResults.reduce((s, r) => s + parseFloat(r.sgpa), 0) / allResults.length).toFixed(2);
    await query('UPDATE results SET cgpa = ? WHERE student_id = ?', [cgpa, student]);

    const rows = await query('SELECT * FROM results WHERE id = ?', [resultId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get student results
router.get('/student', studentAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM results WHERE student_id = ? ORDER BY semester ASC, exam_type ASC', [req.user.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get all results (Admin or Faculty)
router.get('/all', staffAuth, async (req, res) => {
  try {
    const { student, semester, examType } = req.query;
    let sql = 'SELECT r.*, s.name as student_name, s.roll_number FROM results r JOIN students s ON r.student_id = s.id WHERE 1=1';
    const params = [];
    if (student) { sql += ' AND r.student_id = ?'; params.push(student); }
    if (semester) { sql += ' AND r.semester = ?'; params.push(semester); }
    if (examType) { sql += ' AND r.exam_type = ?'; params.push(examType); }
    sql += ' ORDER BY r.created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
