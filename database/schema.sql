CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(50),
 email VARCHAR(100),
 password VARCHAR(255),
 money INT DEFAULT 0,
 role VARCHAR(10) DEFAULT 'user',
 reset_token VARCHAR(255),
 reset_expires DATETIME
);

CREATE TABLE products (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(255),
 price INT,
 image VARCHAR(255),
 description TEXT,
 account_username VARCHAR(255),
 account_password VARCHAR(255),
 `rank` VARCHAR(50),
 skins INT DEFAULT 0,
 champions INT DEFAULT 0,
 category VARCHAR(50) DEFAULT 'account'
);

CREATE TABLE orders (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 product_id INT,
 price INT,
 discount_code VARCHAR(50),
 final_price INT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE napthe (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 seri VARCHAR(50),
 code VARCHAR(50),
 amount INT,
 status VARCHAR(20) DEFAULT 'pending',
 payment_method VARCHAR(20) DEFAULT 'card'
);

CREATE TABLE transactions (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 type VARCHAR(20), -- 'deposit', 'purchase', 'refund'
 amount INT,
 description TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 rating INT,
 comment TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discount_codes (
 id INT AUTO_INCREMENT PRIMARY KEY,
 code VARCHAR(50) UNIQUE,
 discount_percent INT,
 max_uses INT,
 used_count INT DEFAULT 0,
 expires_at DATETIME
);

CREATE TABLE news (
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(255),
 content TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);