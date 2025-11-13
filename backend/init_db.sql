CREATE TABLE Customers (
 customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
 first_name VARCHAR(100),
 last_name VARCHAR(100),
 age INTEGER,
 country VARCHAR(100)
);
INSERT INTO Customers (first_name, last_name, age, country) VALUES
('John', 'Doe', 30, 'USA'),
('Robert', 'Luna', 22, 'USA'),
('David', 'Robinson', 25, 'UK'),
('John', 'Reinhardt', 22, 'UK'),
('Betty', 'Doe', 28, 'UAE');
CREATE TABLE Orders (
 order_id INTEGER PRIMARY KEY AUTOINCREMENT,
 item VARCHAR(100),
 amount INTEGER,
 customer_id INTEGER,
 FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);
INSERT INTO Orders (item, amount, customer_id) VALUES
('Keyboard', 400, 4),
('Mouse', 300, 4),
('Monitor', 12000, 3),
('Keyboard', 400, 1),
('Mousepad', 250, 2);
CREATE TABLE Shippings (
 shipping_id INTEGER PRIMARY KEY AUTOINCREMENT,
 status VARCHAR(100),
 customer INTEGER
);
INSERT INTO Shippings (status, customer) VALUES
('Pending', 2),
('Pending', 4),
('Delivered', 3),
('Pending', 5),
('Delivered', 1);
