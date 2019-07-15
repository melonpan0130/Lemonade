CREATE TABLE adeUser (
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
  -- add date later .. create time
  createTime DATETIME DEFAULT NOW(),
  PRIMARY KEY (`id`),
  FOREIGN KEY(userId) REFERENCES adeUser (id) ON DELETE CASCADE
) ENGINE = InnoDB character set=utf8;

CREATE TABLE comment (
  id INT NOT NULL AUTO_INCREMENT,
  writerId INT not null,
  userId INT NOT NULL, 
  boardId INT NOT NULL,
  content NVARCHAR(200) NOT NULL,
  depth INT DEFAULT '0',
  parentId INT,
  PRIMARY KEY (`id`),
  FOREIGN KEY(userId) REFERENCES adeUser (id) ON DELETE CASCADE,
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

DROP TABLE ADEUSER;

CREATE TABLE ADEUSER 
(
  ID NUMBER NOT NULL 
, NAME VARCHAR2(20) NOT NULL 
, EMAIL VARCHAR2(45) NOT NULL 
, PW VARCHAR2(45) NOT NULL 
, CONSTRAINT ADEUSER_PK PRIMARY KEY 
  (
    ID 
  )
  ENABLE 
);

CREATE SEQUENCE USERID INCREMENT BY 1 START WITH 1;

CREATE TRIGGER ADEUSER_TRG 
BEFORE INSERT ON ADEUSER 
FOR EACH ROW 
BEGIN
  <<COLUMN_SEQUENCES>>
  BEGIN
    IF INSERTING AND :NEW.ID IS NULL THEN
      SELECT USERID.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
  END COLUMN_SEQUENCES;
END;
/

CREATE TABLE BOARD 
(
  ID NUMBER NOT NULL 
, USERID NUMBER NOT NULL 
, TITLE VARCHAR2(45) NOT NULL 
, CONTENT VARCHAR2(200) 
, IMG BLOB 
, CREATETIME TIMESTAMP DEFAULT SYSDATE NOT NULL 
, CONSTRAINT BOARD_PK PRIMARY KEY 
  (
    ID 
  )
  ENABLE 
);


INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES ('hello1', 'hi@naver.com', '1234');
INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES ('hello2', 'hun@naver.com', '1234');

