# k8s/mysql-init-scripts-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-init-scripts
data:
  init.sql: |
    CREATE DATABASE IF NOT EXISTS your-database-name;
    USE your-database-name;
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      pword VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_status (
      order_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone_number VARCHAR(255),
      country VARCHAR(255),
      city VARCHAR(255),
      street_address VARCHAR(255),
      province VARCHAR(255),
      postal_code VARCHAR(255),
      note TEXT,
      is_paid TINYINT DEFAULT 0,
      order_status VARCHAR(255) DEFAULT 'pending',
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      product_id INT NOT NULL
    );
