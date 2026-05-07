const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const studentAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rows = await query('SELECT id, name, email, roll_number, phone, department, course, semester, batch, profile_photo, parent_name, parent_phone, address, status FROM students WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ message: 'Token is not valid' });

    req.user = rows[0];
    req.userType = 'student';
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rows = await query('SELECT id, name, email, role, profile_photo, last_login FROM admins WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ message: 'Token is not valid' });

    req.user = rows[0];
    req.userType = 'admin';
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const facultyAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rows = await query('SELECT id, name, email, employee_id, department, designation, phone, profile_photo, status FROM faculty WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ message: 'Token is not valid' });

    req.user = rows[0];
    req.userType = 'faculty';
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Combined auth - allows both admin and faculty
const staffAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Try admin first
    let rows = await query('SELECT id, name, email, role, profile_photo, last_login FROM admins WHERE id = ?', [decoded.id]);
    if (rows.length > 0) {
      req.user = rows[0];
      req.userType = 'admin';
      return next();
    }
    // Try faculty
    rows = await query('SELECT id, name, email, employee_id, department, designation, phone, profile_photo, status FROM faculty WHERE id = ?', [decoded.id]);
    if (rows.length > 0) {
      req.user = rows[0];
      req.userType = 'faculty';
      return next();
    }
    return res.status(401).json({ message: 'Token is not valid' });
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { studentAuth, adminAuth, facultyAuth, staffAuth };
