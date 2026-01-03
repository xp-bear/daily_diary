const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'daily_diary',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 初始化数据库
async function initDatabase() {
  try {
    // 先连接到 MySQL 服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });

    // 创建数据库（如果不存在）
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'daily_diary'} 
       DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    
    console.log('✅ 数据库创建成功或已存在');
    await connection.end();

    // 使用连接池创建表
    await createTables();
    
    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

// 创建数据表
async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        avatar VARCHAR(255) DEFAULT '😊',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 用户表创建成功');

    // 创建日记表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS diaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        diary_date DATE NOT NULL,
        content TEXT NOT NULL,
        mood VARCHAR(10) DEFAULT '😊',
        weather VARCHAR(10) DEFAULT '☀️',
        images TEXT,
        videos TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, diary_date),
        INDEX idx_user_date (user_id, diary_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 日记表创建成功');
    
    // 为已存在的表添加媒体字段（如果不存在）
    try {
      // 检查列是否存在，不存在则添加
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'diaries'
      `, [process.env.DB_NAME || 'daily_diary']);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      
      if (!columnNames.includes('images')) {
        await connection.query('ALTER TABLE diaries ADD COLUMN images TEXT');
        console.log('✅ 添加 images 字段成功');
      }
      
      if (!columnNames.includes('videos')) {
        await connection.query('ALTER TABLE diaries ADD COLUMN videos TEXT');
        console.log('✅ 添加 videos 字段成功');
      }
    } catch (error) {
      console.error('❌ 添加媒体字段失败:', error.message);
    }

  } finally {
    connection.release();
  }
}

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

module.exports = {
  pool,
  initDatabase,
  testConnection
};
