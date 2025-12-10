-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  originalPrice REAL,
  image TEXT NOT NULL,
  images TEXT, -- JSON 数组字符串
  description TEXT,
  material TEXT,
  stone TEXT,
  size TEXT,
  inStock INTEGER DEFAULT 1, -- 0 或 1
  featured INTEGER DEFAULT 0, -- 0 或 1
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category) REFERENCES categories(id)
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total REAL NOT NULL,
  customerName TEXT,
  customerPhone TEXT,
  customerAddress TEXT,
  customerEmail TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, completed, cancelled
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单项表
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  productName TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_inStock ON products(inStock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);

-- 插入初始分类数据
INSERT OR IGNORE INTO categories (id, name, icon) VALUES
  ('rings', '戒指', '💍'),
  ('necklaces', '项链', '📿'),
  ('earrings', '耳环', '👂'),
  ('bracelets', '手镯', '💎');

-- 插入初始商品数据
INSERT OR IGNORE INTO products (name, category, price, originalPrice, image, images, description, material, stone, size, inStock, featured) VALUES
  ('经典钻石戒指', 'rings', 12999, 15999, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 
   '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800","https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800"]',
   '优雅经典的钻石戒指，采用优质18K白金打造，主石为1.5克拉完美切割钻石，周围镶嵌精美小钻，彰显高贵气质。',
   '18K白金', '1.5克拉钻石', '可定制', 1, 1),
  
  ('珍珠项链', 'necklaces', 8999, 10999, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
   '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800","https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800"]',
   '优雅的天然珍珠项链，每颗珍珠都经过精心挑选，光泽温润，适合各种场合佩戴。',
   '天然珍珠 + 925银', '天然珍珠', '45cm', 1, 1),
  
  ('蓝宝石耳环', 'earrings', 15999, 18999, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
   '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800","https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800"]',
   '精致的蓝宝石耳环，采用18K黄金打造，主石为2克拉天然蓝宝石，设计简约而高贵。',
   '18K黄金', '2克拉蓝宝石', '标准', 1, 1),
  
  ('翡翠手镯', 'bracelets', 25999, 29999, 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800',
   '["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800"]',
   '传统工艺打造的翡翠手镯，选用上等翡翠原料，色泽翠绿通透，寓意美好。',
   '天然翡翠', 'A级翡翠', '可定制', 1, 0),
  
  ('玫瑰金手链', 'bracelets', 5999, 7999, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
   '["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800"]',
   '时尚的玫瑰金手链，设计简约现代，适合日常佩戴，展现优雅品味。',
   '18K玫瑰金', '无', '可调节', 1, 0),
  
  ('钻石吊坠', 'necklaces', 19999, 23999, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
   '["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"]',
   '精美的钻石吊坠，采用心形设计，主石为2克拉完美切割钻石，寓意永恒的爱。',
   '18K白金', '2克拉钻石', '标准', 1, 1);

