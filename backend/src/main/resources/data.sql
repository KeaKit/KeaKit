/*
-- 1. Insertar Categorías (Importante: El status debe coincidir con el check constraint)
INSERT INTO categories (name, description, status, min_price, max_price) VALUES
('Herramientas', 'Equipos para construcción', 'ACTIVE', 5.0, 500.0),
('Electrónica', 'Gadgets y cámaras', 'ACTIVE', 10.0, 1000.0);

-- 2. Insertar Usuarios
INSERT INTO users (name, email, password, role, city, address, phone) VALUES
('Admin', 'admin@example.com', '{noop}admin123', 'ADMIN', 'Madrid', 'Calle 1', '123'),
('Pedro Dueño', 'pedro@example.com', 'pass123', 'USER', 'Barcelona', 'Calle 2', '456'),
('Lucía Cliente', 'lucia@example.com', 'pass123', 'USER', 'Sevilla', 'Calle 3', '789');


-- 3. Insertar Items (Tabla base)
-- Nota: category_id y owner_id deben existir
INSERT INTO items (title, description, city, price_per_month, category_id, owner_id, available_from, available_until) VALUES
('Taladro Percutor', '800W Profesional', 'Barcelona', 25.0, 1, 2, '2024-01-01', '2025-12-31'),
('Cámara Canon', 'EOS R6', 'Barcelona', 150.0, 2, 2, '2024-01-01', '2025-12-31');

-- 4. Insertar Articles (Relacionados con el ID de Items)
INSERT INTO articles (id, image_url, status, purchase_date) VALUES
(1, 'http://img.com/t.jpg', 'AVAILABLE', '2023-01-01'),
(2, 'http://img.com/c.jpg', 'RENTED', '2023-05-01');

-- 5. Insertar un Kit (Reserva/Paquete)
INSERT INTO kits (name, city, country, status, tenant_id, start_date, end_date, delivery_method) VALUES
('Mi Alquiler Junio', 'Barcelona', 'España', 'ACTIVE', 3, '2024-06-01', '2024-06-15', 'MEETING_POINT');

-- 6. Relacionar Items con el Kit (kit_items)
INSERT INTO kit_items (kit_id, item_id, quantity) VALUES (1, 1, 1);
*/