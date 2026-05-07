const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'college_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function transaction(queries) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const results = [];
    for (const { sql, params } of queries) {
      const [rows] = await connection.execute(sql, params);
      results.push(rows);
    }
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, query, transaction };
