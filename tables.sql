DROP SEQUENCE COMMID;
DROP SEQUENCE USERID;
DROP TABLE HEART;
DROP TABLE COMMENTS;
DROP TABLE BOARD;
DROP TABLE ADEUSER;

-- ADEUSER
CREATE TABLE ADEUSER 
(
  USERID NUMBER NOT NULL 
, NAME VARCHAR2(20) NOT NULL 
, EMAIL VARCHAR2(45) NOT NULL 
, PW VARCHAR2(45) NOT NULL 
, PRO CHAR(1) DEFAULT 0 NOT NULL 
, REPORTED CHAR(1) DEFAULT 0 NOT NULL 
, CONSTRAINT ADEUSER_PK PRIMARY KEY 
  (
    USERID 
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
    IF INSERTING AND :NEW.USERID IS NULL THEN
      SELECT USERID.NEXTVAL INTO :NEW.USERID FROM SYS.DUAL;
    END IF;
  END COLUMN_SEQUENCES;
END;
/

-- BOARD
CREATE TABLE BOARD 
(
  USERID NUMBER NOT NULL 
, BOARDID NUMBER NOT NULL
, TITLE VARCHAR2(45) NOT NULL
, CONTENT VARCHAR2(200) NOT NULL
, PRICE NUMBER NOT NULL
, IMG BLOB 
, CREATETIME TIMESTAMP DEFAULT SYSDATE NOT NULL 
, CONSTRAINT BOARD_PK PRIMARY KEY 
  (
    USERID, BOARDID
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
  USERID 
)
ON DELETE CASCADE ENABLE;

CREATE OR REPLACE FUNCTION StoredFunction (user_id NUMBER)
RETURN NUMBER 
IS
  board_id NUMBER := 0;
BEGIN 
  SELECT COUNT(*) INTO board_id FROM BOARD WHERE USERID = user_id;
  RETURN board_id + 1;
END;
/

CREATE OR REPLACE TRIGGER set_boardid
BEFORE INSERT ON BOARD
FOR EACH ROW
BEGIN
  :NEW.BOARDID := StoredFunction(:NEW.USERID);
END;
/

-- COMMENTS
CREATE TABLE COMMENTS 
(
  USERID NUMBER NOT NULL 
, BOARDID NUMBER NOT NULL 
, COMMENTID NUMBER NOT NULL 
, WRITERID NUMBER NOT NULL 
, CONTENT VARCHAR2(200) NOT NULL 
, DEPTH NUMBER DEFAULT 0 
, PARENTID NUMBER 
, CONSTRAINT COMMENTS_PK PRIMARY KEY
  (
    USERID, BOARDID, COMMENTID
  )
  ENABLE 
);

-- COMMENT'S FKS
ALTER TABLE COMMENTS
ADD CONSTRAINT COMMENTS_FK1 FOREIGN KEY
(
  USERID 
, BOARDID 
)
REFERENCES BOARD
(
  USERID 
, BOARDID 
)
ENABLE;

ALTER TABLE COMMENTS
ADD CONSTRAINT COMMENTS_FK2 FOREIGN KEY
(
  WRITERID 
)
REFERENCES ADEUSER
(
  USERID 
)
ENABLE;

drop function StoredFunction2;

CREATE OR REPLACE FUNCTION StoredFunction2 (user_id NUMBER, board_id NUMBER)
RETURN NUMBER 
IS
  comment_id NUMBER := 0;
BEGIN 
  SELECT COUNT(*) INTO comment_id FROM COMMENTS WHERE USERID = user_id AND BOARDID = board_id;
  RETURN comment_id + 1;
END;
/

CREATE OR REPLACE TRIGGER set_commentid
BEFORE INSERT ON COMMENTS
FOR EACH ROW
BEGIN
  :NEW.COMMENTID := StoredFunction2(:NEW.USERID, :NEW.BOARDID);
END;
/

-- heart
CREATE TABLE HEART 
(
  USERID NUMBER NOT NULL 
, BOARDID NUMBER NOT NULL 
, HEARTID NUMBER NOT NULL 
, LIKEID NUMBER NOT NULL 
, CONSTRAINT HEART_PK PRIMARY KEY 
  (
    USERID, BOARDID, HEARTID 
  )
  ENABLE 
);

ALTER TABLE HEART
ADD CONSTRAINT HEART_FK1 FOREIGN KEY
(
  USERID 
, BOARDID 
)
REFERENCES BOARD
(
  USERID 
, BOARDID 
)
ENABLE;

ALTER TABLE HEART
ADD CONSTRAINT HEART_FK2 FOREIGN KEY
(
  LIKEID 
)
REFERENCES ADEUSER
(
  USERID 
)
ENABLE;

CREATE OR REPLACE TRIGGER set_heartid
BEFORE INSERT ON HEART
FOR EACH ROW
DECLARE
heart_id NUMBER;
BEGIN
  SELECT COUNT(*)+1 INTO heart_id FROM HEART WHERE LIKEID = :NEW.LIKEID;
  :NEW.HEARTID := heart_id;
END;
/

CREATE OR REPLACE FUNCTION ISHEART (user_id NUMBER, board_id NUMBER)
RETURN NUMBER
IS
  is_like NUMBER;
BEGIN
  SELECT COUNT(*) INTO is_like FROM HEART WHERE USERID=user_id AND BOARDID=board_id;
  RETURN is_like;
END;
/

CREATE TABLE CHATTING 
(
  ROOM VARCHAR2(20) NOT NULL 
, MSGID NUMBER NOT NULL 
, WRITER NUMBER NOT NULL 
, MESSAGE VARCHAR2(20) NOT NULL 
, TIME DATE NOT NULL 
, CONSTRAINT CHATTING_PK PRIMARY KEY 
  (
    MSGID 
  )
  ENABLE 
);

ALTER TABLE CHATTING
ADD CONSTRAINT CHATTING_FK1 FOREIGN KEY
(
  WRITER 
)
REFERENCES ADEUSER
(
  USERID 
)
ENABLE;

CREATE TABLE RECEIPT 
(
  USERID NUMBER NOT NULL 
, BOARDID NUMBER NOT NULL 
, BUYER NUMBER NOT NULL 
, PRICE NUMBER NOT NULL 
, TIME TIMESTAMP DEFAULT SYSDATE
);

drop table receipt;
ALTER TABLE RECEIPT
ADD CONSTRAINT RECEIPT_FK1 FOREIGN KEY
(
  USERID 
, BOARDID 
)
REFERENCES BOARD
(
  USERID 
, BOARDID 
)
ENABLE;

ALTER TABLE RECEIPT
ADD CONSTRAINT RECEIPT_FK2 FOREIGN KEY
(
  BUYER 
)
REFERENCES ADEUSER
(
  USERID 
)
ENABLE;

CREATE VIEW SUBRECEIPT
AS SELECT 
    he.userid, he.boardid, he.likeid, b.price, he.heartid
FROM board b, heart he
WHERE b.userid=he.userid AND b.boardid=he.boardid;

CREATE VIEW BOARDINFO
AS SELECT AD.USERID, AD.NAME, B.BOARDID, B.TITLE, B.CONTENT, B.CREATETIME
  FROM ADEUSER AD, BOARD B
  WHERE AD.USERID = B.USERID;

INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES ('hello1', 'hi@naver.com', '1234');
INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES ('hello2', 'hun@naver.com', '1234');
INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES ('eun', 'eun@naver.com', '1234');

INSERT INTO BOARD (USERID, TITLE, CONTENT, PRICE) VALUES ('1', 'Icecream', 'It is very delicious!', 12000);
INSERT INTO BOARD (USERID, TITLE, CONTENT, PRICE) VALUES ('1', 'Coffee', 'I like it.', 13000);
INSERT INTO BOARD (USERID, TITLE, CONTENT, PRICE) VALUES ('1', 'Ice Coffee', 'I always drink.', 13000);
INSERT INTO BOARD (USERID, TITLE, CONTENT, PRICE) VALUES ('2', 'Cake', 'this is chocolate cake.', 15000);
INSERT INTO BOARD (USERID, TITLE, CONTENT, PRICE) VALUES ('2', 'Banana', 'this is banana.', 15000);

SELECT * FROM BOARD;

-- ���ƿ� ��, ���� ����.
/*
SELECT B.USERID, B.TITLE, B.CONTENT, HE.
FROM BOARD B, HEART HE
WHERE B.USERID=HE.USERID AND B.BOARDID=HE.BOARDID;
*/
-- SELECT * FROM HEART
 
commit;
-- �Խù��� ����, �����ϴ� �ο���, �� ���� ���� ���ϱ�
SELECT B.USERID, B.TITLE, B.CONTENT, (SELECT COUNT(*) FROM HEART HE WHERE HE.USERID=B.USERID AND HE.BOARDID=B.BOARDID) AS LIKED,
(SELECT COUNT(*) FROM HEART HE WHERE HE.USERID=B.USERID AND HE.BOARDID=B.BOARDID AND HE.LIKEID = 1) AS ISLIKE
FROM BOARD B;
SELECT ISHEART(USERID, BOARDID) FROM board;


INSERT INTO COMMENTS (USERID, BOARDID, WRITERID, CONTENT) VALUES ('1', '1', '2', 'hello');

DESC HEART;

INSERT INTO HEART (USERID, BOARDID, LIKEID) VALUES ('1', '1', '2');
INSERT INTO HEART (USERID, BOARDID, LIKEID) VALUES ('1', '1', '3');
INSERT INTO HEART (USERID, BOARDID, LIKEID) VALUES ('1', '2', '2');
INSERT INTO HEART (USERID, BOARDID, LIKEID) VALUES ('2', '1', '1');
INSERT INTO HEART (USERID, BOARDID, LIKEID) VALUES ('2', '2', '1');

commit;