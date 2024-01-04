DELIMITER //
CREATE TRIGGER AfterSale
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    UPDATE products SET stock = stock - NEW.qty WHERE pid = NEW.pid;
END//
DELIMITER ;
