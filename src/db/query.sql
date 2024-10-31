-- SQLite
CREATE TABLE pending_orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    country TEXT,
    city TEXT,
    street_address TEXT,
    state TEXT,
    postal_code TEXT,
    note TEXT,
    payment_method TEXT NOT NULL,
    total REAL NOT NULL,
    discount REAL,
    shipping REAL,
    is_paid INTEGER DEFAULT 0,
    order_status TEXT DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_id INTEGER NOT NULL
);

