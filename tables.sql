DROP SEQUENCE USERID;
DROP TABLE COMMENTS;
DROP TABLE BOARD;
DROP TABLE ADEUSER;

-- ADEUSER
CREATE TABLE ADEUSER
(
  ID NUMBER NOT NULL 
, NAME VARCHAR2(20) NOT NULL -- 20
, EMAIL VARCHAR2(45) NOT NULL -- 45
, PW VARCHAR2(45) NOT NULL  -- 45
, CONSTRAINT ADEUSER_PK PRIMARY KEY 
  (
    ID 
  )
  ENABLE 
);

CREATE SEQUENCE USERID INCREMENT BY 1 START WITH 1;
-- 시퀀스 증가
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

-- BOARD
CREATE TABLE BOARD 
(
  USERID NUMBER NOT NULL 
, ID NUMBER NOT NULL 
, TITLE VARCHAR2(45) NOT NULL
, CONTENT VARCHAR2(200) 
, IMG BLOB 
, CREATETIME TIMESTAMP DEFAULT SYSDATE NOT NULL 
, CONSTRAINT BOARD_PK PRIMARY KEY 
  (
    USERID, ID
  )
  ENABLE 
);

ALTER TABLE BOARD
ADD CONSTRAINT BOARD_FK1 FOREIGN KEY
(
  USERID
)
REFERENCES ADEUSER
(
  ID 
)
ON DELETE CASCADE ENABLE;

-- COMMENTS
CREATE TABLE COMMENTS 
(
  USERID NUMBER NOT NULL 
, BOARDID NUMBER NOT NULL 
, ID NUMBER NOT NULL 
, WRITERID NUMBER NOT NULL 
, CONTENT VARCHAR2(200) NOT NULL 
, DEPTH NUMBER DEFAULT 0 
, PARENTID NUMBER 
, CONSTRAINT COMMENTS_PK PRIMARY KEY 
  (
    USERID, BOARDID, ID 
  )
  ENABLE 
);

-- COMMENT'S FKS
ALTER TABLE COMMENTS
ADD CONSTRAINT COMMENTS_FK1 FOREIGN KEY
(
  WRITERID 
)
REFERENCES ADEUSER
(
  ID 
)
ON DELETE CASCADE ENABLE;

ALTER TABLE COMMENTS
ADD CONSTRAINT COMMENTS_FK2 FOREIGN KEY
(
  USERID 
)
REFERENCES ADEUSER
(
  ID 
)
ON DELETE CASCADE ENABLE;

INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES ('hello1', 'hi@naver.com', '1234');
INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES ('hello2', 'hun@naver.com', '1234');

INSERT INTO BOARD (USERID, ID, TITLE, CONTENT) VALUES ('5', '1', 'Icecream', 'It is very delicious!');
INSERT INTO BOARD (USERID, ID, TITLE, CONTENT) VALUES ('5', '2', 'Coffee', 'I like it.');
INSERT INTO BOARD (USERID, ID, TITLE, CONTENT) VALUES ('6', '1', 'Cake', 'this is chocolate cake.');

SELECT * FROM BOARD ORDER BY CREATETIME DESC;