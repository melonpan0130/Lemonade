CREATE TABLE user (
  id INT NOT NULL AUTO_INCREMENT,
  name NVARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  pw VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB character set=utf8;

--
CREATE TABLE board (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  userName NVARCHAR(45) NOT NULL,
  title NVARCHAR(45) NOT NULL,
  content LONGTEXT NULL,
  img MEDIUMBLOB NULL,
  -- add date later .. create time
  createTime DATETIME DEFAULT NOW(),
  PRIMARY KEY (`id`),
  FOREIGN KEY(userId) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB character set=utf8;

CREATE TABLE comment (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  boardId INT NOT NULL,
  userName NVARCHAR(45) NOT NULL,
  content NVARCHAR(200) NOT NULL,
  depth INT DEFAULT '0',
  parentId INT,
  PRIMARY KEY (`id`),
  FOREIGN KEY(userId) REFERENCES user (id) ON DELETE CASCADE,
  FOREIGN KEY(boardId) REFERENCES board (id) ON DELETE CASCADE
) ENGINE = InnoDB character set=utf8;

INSERT INTO user (name, email, pw) VALUES ('hi', 'hi@naver.com', '1234');
INSERT INTO user (name, email, pw) VALUES ('he', 'hun@naver.com', '1234');

INSERT INTO board (userId, userName, title, content) VALUES ('1', 'hi', 'IceCream', 'It is very good');
INSERT INTO board (userId, userName, title, content) VALUES ('1', 'hi', 'Coffie', 'I am selling ...');
INSERT INTO board (userId, userName, title, content) VALUES ('2', 'he', 'Cake', 'I am selling about...');

INSERT INTO comment (boardId, userId, userName, content) VALUES ('1', '1', 'who', 'hello! I want to buy one...');
INSERT INTO comment (boardId, userId, userName, content) VALUES ('1', '1', 'who', 'Was it sold?');
INSERT INTO comment (boardId, userId, userName, content) VALUES ('2', '2', 'who', 'hello! I want to buy one...');
INSERT INTO comment (boardId, userId, userName, content) VALUES ('3', '2', 'who', 'hello! I want to buy one...');