-- Script di creazione del database per la piattaforma e-commerce artigianale
-- Creare il database
CREATE DATABASE IF NOT EXISTS artisan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE artisan;

-- Tabella degli utenti
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    avatar VARCHAR(255),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    birthdate DATE,
    role ENUM('cliente', 'artigiano', 'admin') DEFAULT 'cliente',
    status ENUM('active', 'blocked') DEFAULT 'active',
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Italia',
    is_artisan BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(255),
    bio TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabella delle categorie di prodotti
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella dei prodotti
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category_id INT,
    artisan_id INT NOT NULL,
    images JSON,
    main_image VARCHAR(255),
    dimensions VARCHAR(100),
    weight DECIMAL(8,2),
    materials TEXT,
    techniques TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella delle ordinazioni
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_method VARCHAR(50) NOT NULL DEFAULT 'standard',
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    
    -- Informazioni di spedizione
    shipping_first_name VARCHAR(50) NOT NULL,
    shipping_last_name VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_postal_code VARCHAR(10) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20),
    
    -- Informazioni di fatturazione
    billing_first_name VARCHAR(50) NOT NULL,
    billing_last_name VARCHAR(50) NOT NULL,
    billing_address TEXT NOT NULL,
    billing_postal_code VARCHAR(10) NOT NULL,
    billing_city VARCHAR(100) NOT NULL,
    billing_country VARCHAR(100) NOT NULL,
    
    -- Informazioni di pagamento
    payment_method ENUM('card', 'paypal', 'google_pay', 'cash') NOT NULL DEFAULT 'card',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',

    -- Aggiungi campi per tracking completo
    tracking_number VARCHAR(100) NULL,
    estimated_delivery DATE NULL,
    actual_delivery_date DATE NULL,
    payment_processed_at TIMESTAMP NULL,
    order_processed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tabella dei dettagli dell'ordine
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Tabella del carrello
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Tabella dei commenti e recensioni
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Tabella dei messaggi
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella dei preferiti
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_favorite (user_id, product_id)
);

-- Tabella delle filiali per pagamento in contanti
CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    opening_hours TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella per le transazioni di pagamento
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method ENUM('card', 'paypal', 'google_pay', 'cash') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_order_id (order_id),
    INDEX idx_payment_method (payment_method)
);

-- Inserimento delle categorie predefinite
INSERT INTO categories (name, description, icon) VALUES
('Gioielli', 'Creazioni uniche in metallo, pietre e materiali preziosi', 'fas fa-gem'),
('Decorazione', 'Oggetti decorativi per arricchire la tua casa', 'fas fa-home'),
('Tessuto', 'Vesti, accessori e tessuti artigianali', 'fas fa-tshirt'),
('Ceramica', 'Vasi, piatti e oggetti in terracotta', 'fas fa-mug-hot'),
('Legno', 'Sculture e oggetti in legno massiccio', 'fas fa-tree'),
('Cuoio', 'Accessori e oggetti in cuoio vero', 'fas fa-shoe-prints'),
('Vetro', 'Oggetti in vetro soffiato e vitraio', 'fas fa-wine-glass'),
('Metallo', 'Sculture e oggetti in metallo forgiato', 'fas fa-hammer');

-- Inserimento di un utente amministratore predefinito
-- Password: admin123 (hash con bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin, is_artisan) VALUES
('admin', 'admin@artisan.com', '$2b$10$rQZ8K9mN2pL4vX7cF1hJ3qR5tY8uI0oP1aB2cD3eF4gH5iJ6kL7mN8oP9qR', 'Admin', 'Sistema', TRUE, FALSE);

-- Inserisci alcune filiali di esempio
INSERT INTO branches (name, address, city, postal_code, phone, email, opening_hours) VALUES
('Filiale Centrale - Paris', '123 Rue de Rivoli', 'Paris', '75001', '+33123456789', 'paris@artisanat.fr', 'Lun-Ven: 9h-18h, Sam: 9h-17h'),
('Filiale Lyon', '456 Rue de la République', 'Lyon', '69001', '+33456789012', 'lyon@artisanat.fr', 'Lun-Ven: 9h-18h, Sam: 9h-17h'),
('Filiale Marseille', '789 La Canebière', 'Marseille', '13001', '+33456789013', 'marseille@artisanat.fr', 'Lun-Ven: 9h-18h, Sam: 9h-17h'),
('Filiale Bordeaux', '321 Cours de l\'Intendance', 'Bordeaux', '33000', '+33567890123', 'bordeaux@artisanat.fr', 'Lun-Ven: 9h-18h, Sam: 9h-17h');

-- Aggiorna la tabella orders per supportare tutti i metodi di pagamento
ALTER TABLE orders MODIFY COLUMN payment_method ENUM('card', 'paypal', 'google_pay', 'cash') NOT NULL DEFAULT 'card';
ALTER TABLE orders ADD COLUMN branch_id INT NULL AFTER payment_method;
ALTER TABLE orders ADD FOREIGN KEY (branch_id) REFERENCES branches(id);

-- Aggiorna la tabella orders per stati completi
ALTER TABLE orders MODIFY COLUMN status ENUM(
    'pending',           -- Ordine creato, in attesa di pagamento
    'payment_pending',   -- Pagamento in corso
    'payment_completed', -- Pagamento completato
    'processing',        -- Ordine in elaborazione
    'shipped',          -- Ordine spedito
    'delivered',        -- Ordine consegnato
    'cancelled',        -- Ordine cancellato
    'refunded'          -- Ordine rimborsato
) DEFAULT 'pending';

-- Aggiorna payment_status per stati dettagliati
ALTER TABLE orders MODIFY COLUMN payment_status ENUM(
    'pending',      -- In attesa di pagamento
    'processing',   -- Pagamento in elaborazione
    'completed',    -- Pagamento completato
    'failed',       -- Pagamento fallito
    'refunded',     -- Pagamento rimborsato
    'cancelled'     -- Pagamento cancellato
) DEFAULT 'pending';

-- Tabella per cronologia stati ordini
CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NULL,
    notes TEXT,
    created_by INT NULL, -- user_id che ha cambiato lo stato
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tabella per notifiche ordini
CREATE TABLE order_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('email', 'sms', 'push') NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at)
);
