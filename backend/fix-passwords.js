/**
 * Fix Password Hashes
 * This script generates and updates the correct bcrypt hashes for admin and faculty accounts
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./config/db');

async function fixPasswords() {
  try {
    console.log('\n🔧 Fixing Password Hashes...\n');

    // Generate correct hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const facultyHash = await bcrypt.hash('faculty123', 10);

    console.log('Generated Hashes:');
    console.log('Admin (admin123):', adminHash);
    console.log('Faculty (faculty123):', facultyHash, '\n');

    // Update admin password
    console.log('Updating admin password...');
    await query('UPDATE admins SET password = ? WHERE email = ?', [adminHash, 'admin@college.edu']);
    console.log('✅ Admin password updated\n');

    // Update faculty password
    console.log('Updating faculty password...');
    await query('UPDATE faculty SET password = ? WHERE email = ?', [facultyHash, 'faculty@college.edu']);
    console.log('✅ Faculty password updated\n');

    // Verify
    console.log('🔐 Verifying passwords...\n');
    
    const admin = await query('SELECT password FROM admins WHERE email = ?', ['admin@college.edu']);
    const isAdminMatch = await bcrypt.compare('admin123', admin[0].password);
    console.log(`Admin credentials: ${isAdminMatch ? '✅ CORRECT' : '❌ FAILED'}`);
    console.log(`  Email: admin@college.edu`);
    console.log(`  Password: admin123\n`);

    const faculty = await query('SELECT password FROM faculty WHERE email = ?', ['faculty@college.edu']);
    const isFacultyMatch = await bcrypt.compare('faculty123', faculty[0].password);
    console.log(`Faculty credentials: ${isFacultyMatch ? '✅ CORRECT' : '❌ FAILED'}`);
    console.log(`  Email: faculty@college.edu`);
    console.log(`  Password: faculty123\n`);

    console.log('✅ All passwords have been fixed!\n');
    console.log('🎉 You can now login with:');
    console.log('   Admin: admin@college.edu / admin123');
    console.log('   Faculty: faculty@college.edu / faculty123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPasswords();
