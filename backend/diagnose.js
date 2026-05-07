/**
 * Diagnostic Script
 * Check database connectivity and verify credentials
 */

require('dotenv').config();
const { query } = require('./config/db');
const bcrypt = require('bcryptjs');

async function diagnose() {
  try {
    console.log('\n🔍 College Management System - Diagnostic Report\n');
    console.log('📋 Configuration:');
    console.log(`   DB Host: ${process.env.DB_HOST}`);
    console.log(`   DB User: ${process.env.DB_USER}`);
    console.log(`   DB Name: ${process.env.DB_NAME}`);
    console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}\n`);

    // Check database connection
    console.log('🔌 Testing Database Connection...');
    try {
      const result = await query('SELECT 1');
      console.log('   ✅ Database connected successfully\n');
    } catch (err) {
      console.log('   ❌ Database connection failed:', err.message, '\n');
      process.exit(1);
    }

    // Check admin credentials
    console.log('👤 Checking Admin Credentials:');
    const admin = await query('SELECT * FROM admins WHERE email = ?', ['admin@college.edu']);
    
    if (admin.length > 0) {
      console.log('   ✅ Admin account found');
      console.log(`   Name: ${admin[0].name}`);
      console.log(`   Email: ${admin[0].email}`);
      console.log(`   Role: ${admin[0].role}\n`);

      // Test password
      console.log('🔐 Testing Admin Password:');
      const testPassword = 'admin123';
      const isMatch = await bcrypt.compare(testPassword, admin[0].password);
      
      if (isMatch) {
        console.log(`   ✅ Password is correct! Use: ${testPassword}\n`);
      } else {
        console.log('   ❌ Password mismatch\n');
        console.log('   Stored hash:', admin[0].password);
      }
    } else {
      console.log('   ❌ Admin account not found\n');
    }

    // Check faculty credentials
    console.log('👨‍🏫 Checking Faculty Credentials:');
    const faculty = await query('SELECT * FROM faculty WHERE email = ?', ['faculty@college.edu']);
    
    if (faculty.length > 0) {
      console.log('   ✅ Faculty account found');
      console.log(`   Name: ${faculty[0].name}`);
      console.log(`   Email: ${faculty[0].email}`);
      console.log(`   Department: ${faculty[0].department}\n`);

      // Test password
      console.log('🔐 Testing Faculty Password:');
      const testPassword = 'faculty123';
      const isMatch = await bcrypt.compare(testPassword, faculty[0].password);
      
      if (isMatch) {
        console.log(`   ✅ Password is correct! Use: ${testPassword}\n`);
      } else {
        console.log('   ❌ Password mismatch\n');
      }
    } else {
      console.log('   ❌ Faculty account not found\n');
    }

    // Count tables
    console.log('📊 Database Tables:');
    const tables = await query('SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', [process.env.DB_NAME]);
    console.log(`   Total tables: ${tables[0].count}\n`);

    console.log('🎯 Summary:');
    console.log('   ✅ Setup appears to be complete');
    console.log('   📍 Faculty Dashboard: http://localhost:5000/faculty/');
    console.log('   📍 Admin Login: http://localhost:5000/admin/');
    console.log('   📍 Student Portal: http://localhost:5000/\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnose();
