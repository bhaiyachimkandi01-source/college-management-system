const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { adminAuth, staffAuth } = require('../middleware/auth');

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [students] = await query('SELECT COUNT(*) as count FROM students');
    const [faculty] = await query('SELECT COUNT(*) as count FROM faculty');
    const [feeCollection] = await query('SELECT SUM(paid_amount) as total FROM fees');
    const [pendingFees] = await query('SELECT COUNT(*) as count FROM fees WHERE status IN ("pending", "partial")');
    const [activeStudents] = await query('SELECT COUNT(*) as count FROM students WHERE status = "active"');
    const [inactiveStudents] = await query('SELECT COUNT(*) as count FROM students WHERE status = "inactive"');
    const [totalResults] = await query('SELECT COUNT(*) as count FROM results');
    const recentStudents = await query('SELECT name, roll_number, created_at FROM students ORDER BY created_at DESC LIMIT 5');
    const recentNotifications = await query('SELECT n.title, n.type, n.created_at, a.name as sent_by_name FROM notifications n LEFT JOIN admins a ON n.sent_by = a.id ORDER BY n.created_at DESC LIMIT 5');

    res.json({
      totalStudents: students.count,
      totalFaculty: faculty.count,
      totalFeeCollection: feeCollection.total || 0,
      pendingPayments: pendingFees.count,
      activeStudents: activeStudents.count,
      inactiveStudents: inactiveStudents.count,
      totalResults: totalResults.count,
      recentStudents,
      recentNotifications
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Faculty stats endpoint
router.get('/faculty-stats', staffAuth, async (req, res) => {
  try {
    const dept = req.user.department;
    const [students] = await query('SELECT COUNT(*) as count FROM students');
    const [deptStudents] = await query('SELECT COUNT(*) as count FROM students WHERE department = ?', [dept || '']);
    const [attendanceToday] = await query('SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE()');
    const [pendingFees] = await query('SELECT COUNT(*) as count FROM fees WHERE status IN ("pending", "partial")');
    const [totalResults] = await query('SELECT COUNT(*) as count FROM results');
    const [myNotifications] = await query('SELECT COUNT(*) as count FROM notifications WHERE sent_by = ?', [req.user.id]);
    const recentStudents = await query('SELECT name, roll_number, department, created_at FROM students ORDER BY created_at DESC LIMIT 5');
    const todayAttendance = await query('SELECT a.*, s.name as student_name, s.roll_number FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.date = CURDATE() ORDER BY a.created_at DESC LIMIT 10');

    res.json({
      totalStudents: students.count,
      deptStudents: deptStudents.count,
      attendanceToday: attendanceToday.count,
      pendingPayments: pendingFees.count,
      totalResults: totalResults.count,
      myNotifications: myNotifications.count,
      recentStudents,
      todayAttendance,
      facultyName: req.user.name,
      facultyDepartment: req.user.department
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
