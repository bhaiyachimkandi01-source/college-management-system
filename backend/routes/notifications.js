const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { studentAuth, adminAuth, staffAuth } = require('../middleware/auth');

// Send notification (Admin or Faculty)
router.post('/', staffAuth, async (req, res) => {
  try {
    const { title, message, type, recipients, sendToAll } = req.body;
    const result = await query('INSERT INTO notifications (title, message, type, send_to_all, sent_by) VALUES (?, ?, ?, ?, ?)',
      [title, message, type, sendToAll ? 1 : 0, req.user.id]);
    const notifId = result.insertId;
    if (!sendToAll && recipients && recipients.length > 0) {
      const values = recipients.map(r => [notifId, r]);
      await query('INSERT INTO notification_recipients (notification_id, student_id) VALUES ?', [values]);
    }
    res.status(201).json({ id: notifId, title, message, type });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get student notifications
router.get('/student', studentAuth, async (req, res) => {
  try {
    const rows = await query(`
      SELECT n.*, nr.is_read FROM notifications n
      LEFT JOIN notification_recipients nr ON n.id = nr.notification_id AND nr.student_id = ?
      WHERE n.send_to_all = TRUE OR nr.student_id = ?
      ORDER BY n.created_at DESC
    `, [req.user.id, req.user.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Mark as read
router.put('/:id/read', studentAuth, async (req, res) => {
  try {
    await query('INSERT INTO notification_recipients (notification_id, student_id, is_read) VALUES (?, ?, TRUE) ON DUPLICATE KEY UPDATE is_read = TRUE',
      [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get all notifications (Admin or Faculty)
router.get('/all', staffAuth, async (req, res) => {
  try {
    const rows = await query('SELECT n.*, a.name as sent_by_name FROM notifications n LEFT JOIN admins a ON n.sent_by = a.id ORDER BY n.created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
