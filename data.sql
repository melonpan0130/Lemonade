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
  title NVARCHAR(45) NOT NULL,
  content LONGTEXT NULL,
  img MEDIUMBLOB NULL,
  -- add date later ..
  PRIMARY KEY (`id`),
  FOREIGN KEY(userId) REFERENCES user (id)
) ENGINE = InnoDB character set=utf8;

CREATE TABLE comment (
  id INT NOT NULL AUTO_INCREMENT,
  boardId INT NOT NULL,
  userName NVARCHAR(45) NOT NULL,
  content NVARCHAR(200) NOT NULL,
  -- add date later ..
  PRIMARY KEY (`id`),
  FOREIGN KEY(boardId) REFERENCES board (id)
) ENGINE = InnoDB character set=utf8;

INSERT INTO user (name, email, pw) VALUES ('hi', 'hi@naver.com', '1234');

INSERT INTO board (userId, content) VALUES ('1', 'It is very good');
INSERT INTO board (userId, content) VALUES ('1', 'I am selling ...');
INSERT INTO board (userId, content) VALUES ('2', 'I am selling about...');


INSERT INTO comment (boardId, userName, content) VALUES ('1', 'who', 'hello! I want to buy one...');