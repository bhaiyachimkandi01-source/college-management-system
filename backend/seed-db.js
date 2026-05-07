/**
 * Database Seeding Script
 * This script inserts default admin and faculty accounts if they don't exist
 */

require('dotenv').config();
const { query } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Hash passwords
    const adminPasswordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // admin123
    const facultyPasswordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // faculty123

    // Check if admin exists
    const adminExists = await query('SELECT * FROM admins WHERE email = ?', ['admin@college.edu']);
    
    if (adminExists.length === 0) {
      await query(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Super Admin', 'admin@college.edu', adminPasswordHash, 'superadmin']
      );
      console.log('✅ Admin account created');
      console.log('   Email: admin@college.edu');
      console.log('   Password: admin123\n');
    } else {
      console.log('ℹ️  Admin account already exists\n');
    }

    // Check if faculty exists
    const facultyExists = await query('SELECT * FROM faculty WHERE email = ?', ['faculty@college.edu']);
    
    if (facultyExists.length === 0) {
      await query(
        'INSERT INTO faculty (name, email, password, employee_id, department, designation, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Dr. John Smith', 'faculty@college.edu', facultyPasswordHash, 'FAC001', 'Computer Science', 'Assistant Professor', 'active']
      );
      console.log('✅ Faculty account created');
      console.log('   Email: faculty@college.edu');
      console.log('   Password: faculty123\n');
    } else {
      console.log('ℹ️  Faculty account already exists\n');
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
