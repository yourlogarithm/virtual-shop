DELIMITER //
CREATE PROCEDURE SellProducts(IN p_card_no CHAR(8), IN p_pid INT, IN p_qty INT, IN p_ts DATE)
BEGIN
    INSERT INTO sales (card_no, pid, qty, ts) VALUES (p_card_no, p_pid, p_qty, p_ts);
END//
DELIMITER ;
