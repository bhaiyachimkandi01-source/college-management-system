const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { studentAuth, adminAuth } = require('../middleware/auth');

// Add fee record
router.post('/', adminAuth, async (req, res) => {
  try {
    const { student, feeType, amount, paidAmount, semester, dueDate } = req.body;
    const paid = paidAmount || 0;
    const due = amount - paid;
    const status = due <= 0 ? 'paid' : paid > 0 ? 'partial' : 'pending';
    const result = await query('INSERT INTO fees (student_id, fee_type, amount, paid_amount, due_amount, semester, due_date, paid_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student, feeType, amount, paid, due, semester, dueDate || null, paid > 0 ? new Date() : null, status]);
    const rows = await query('SELECT f.*, s.name as student_name, s.roll_number, s.email FROM fees f JOIN students s ON f.student_id = s.id WHERE f.id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Update fee payment
router.put('/:id/pay', adminAuth, async (req, res) => {
  try {
    const { paidAmount, transactionId, receiptNumber } = req.body;
    const feeRows = await query('SELECT * FROM fees WHERE id = ?', [req.params.id]);
    if (feeRows.length === 0) return res.status(404).json({ message: 'Fee record not found' });
    const fee = feeRows[0];
    const newPaid = parseFloat(fee.paid_amount) + parseFloat(paidAmount);
    const newDue = parseFloat(fee.amount) - newPaid;
    const status = newDue <= 0 ? 'paid' : 'partial';
    await query('UPDATE fees SET paid_amount = ?, due_amount = ?, paid_date = ?, status = ?, transaction_id = ?, receipt_number = ? WHERE id = ?',
      [newPaid, newDue, new Date(), status, transactionId, receiptNumber, req.params.id]);
    const rows = await query('SELECT f.*, s.name as student_name, s.roll_number, s.email FROM fees f JOIN students s ON f.student_id = s.id WHERE f.id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get student fees
router.get('/student', studentAuth, async (req, res) => {
  try {
    const fees = await query('SELECT * FROM fees WHERE student_id = ? ORDER BY created_at DESC', [req.user.id]);
    const totalDue = fees.reduce((s, f) => s + parseFloat(f.due_amount), 0);
    const totalPaid = fees.reduce((s, f) => s + parseFloat(f.paid_amount), 0);
    res.json({ fees, totalDue, totalPaid });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get all fees (Admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { status, student } = req.query;
    let sql = 'SELECT f.*, s.name as student_name, s.roll_number, s.email FROM fees f JOIN students s ON f.student_id = s.id WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND f.status = ?'; params.push(status); }
    if (student) { sql += ' AND f.student_id = ?'; params.push(student); }
    sql += ' ORDER BY f.created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
