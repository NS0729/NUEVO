-- 创建管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin', -- admin, super_admin
  isActive INTEGER DEFAULT 1, -- 0 或 1
  lastLogin DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建管理员会话表（用于token管理）
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  adminId INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(isActive);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_adminId ON admin_sessions(adminId);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiresAt ON admin_sessions(expiresAt);

-- 插入默认管理员账户（密码: admin123，实际使用时应该使用哈希后的密码）
-- 注意：这是演示密码，生产环境应该使用强密码并立即更改
-- 密码哈希: admin123 (使用简单的哈希，生产环境应使用 bcrypt 或类似)
INSERT OR IGNORE INTO admin_users (username, password_hash, email, role, isActive) VALUES
  ('admin', 'admin123', 'admin@example.com', 'admin', 1);

