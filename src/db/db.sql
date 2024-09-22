CREATE DATABASE IF NOT EXISTS cards_web;
CREATE USER IF NOT EXISTS 'username'@'localhost' IDENTIFIED BY 'password';
GRANT ALL ON cards_web.* TO 'username'@'localhost';

CREATE TABLE IF NOT EXISTS cards_web.users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email_address VARCHAR(100) NOT NULL,
    status ENUM('user', 'admin') DEFAULT 'user',
    avatar_path VARCHAR(255) DEFAULT 'default_icon.png'
);

CREATE TABLE IF NOT EXISTS cards_web.cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(25) NOT NULL UNIQUE,
    type ENUM('creature') NOT NULL,
    hp INT NOT NULL,
    damage INT NOT NULL,
    cost INT NOT NULL,
    description TEXT,
    image_path VARCHAR(255)
);

INSERT INTO cards_web.cards (name, type, hp, damage, cost, description, image_path) VALUES
    ('CapAmerica', 'creature', 10, 5, 4, 'Shield','1.jpg'),
    ('CapMarvel', 'creature', 2, 7, 2, 'Woman','2.jpg'),
    ('Carnage', 'creature', 10, 10, 10, 'Red','3.jpg'),
    ('BPanther', 'creature', 9, 7, 8, 'Panther','4.jpg'),
    ('DrDoom', 'creature', 10, 4, 5, 'Doom','5.jpg'),
    ('DrOctopus', 'creature', 3, 5, 7, 'Tentacles','6.jpg'),
    ('Hulk', 'creature', 10, 10, 10, 'Strong','7.jpg'),
    ('Iron Man', 'creature', 9, 3, 4, 'Iron','8.jpg'),
    ('Kraven', 'creature', 9, 3, 5, 'Hunting','9.jpg'),
    ('Miles', 'creature', 2, 1, 3, 'Not a spidy','10.jpg'),
    ('Mysterio', 'creature', 4, 2, 10, 'Gas','11.jpg'),
    ('Rocket', 'creature', 1, 10, 5, 'Raccoon','12.jpg'),
    ('SpiderMan', 'creature', 6, 3, 8, 'Spidy','13.jpg'),
    ('Thing', 'creature', 10, 8, 9, 'who?', '14.jpg'),
    ('Venom', 'creature', 10, 10, 10, 'Killer','15.jpg'),
    ('Vision', 'creature', 1, 8, 3, 'hmmm...','16.jpg'),
    ('Wolverine', 'creature', 10, 10, 1, 'like him','17.jpg'),
    ('Morbius', 'creature', 1, 1, 1, 'cringe','18.jpg'),
    ('Magneto', 'creature', 10, 3, 5, 'Magnet','19.jpg'),
    ('Juggernaut', 'creature', 20, 10, 7, 'Big guy','20.jpg');

SELECT * FROM cards_web.cards;