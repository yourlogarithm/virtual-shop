DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS products;

CREATE TABLE clients (
    card_no CHAR(8) PRIMARY KEY,
    lname VARCHAR(30),
    fname VARCHAR(30),
    bday DATE
);

CREATE TABLE products (
    pid INT PRIMARY KEY AUTO_INCREMENT,
    pname VARCHAR(80),
    warranty INT CHECK(warranty <= 5),
    stock INT CHECK(stock <= 200),
    uprice DECIMAL
);

CREATE TABLE sales (
    slid INT PRIMARY KEY AUTO_INCREMENT,
    card_no CHAR(8),
    pid INT,
    qty INT,
    ts DATE,
    FOREIGN KEY (card_no) REFERENCES clients(card_no),
    FOREIGN KEY (pid) REFERENCES products(pid)
);