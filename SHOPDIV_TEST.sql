SELECT * FROM TAB;
SELECT * FROM DICT;
SELECT * FROM USER_INDEXES;

-- 사용자 정의 함수
CREATE OR REPLACE FUNCTION fnSum(n IN NUMBER)
RETURN NUMBER
IS 
    s NUMBER := 0;
BEGIN
    -- for(int i=1; i<=100; i++)
    FOR i IN 1..n LOOP s := s+i; END LOOP;
    RETURN s;
END;
/
SELECT fnSum(100) FROM dual;

-- 주민번호 이용하여 성별 구분
CREATE OR REPLACE FUNCTION fnGender(sn IN VARCHAR)
RETURN VARCHAR
IS
    gen VARCHAR(6) := '여자';
BEGIN
    IF LENGTH(sn) !=13 THEN RAISE_APPLICATION_ERROR(-20000, '주민번호는 13자리 입니다.'); END IF;
    IF SUBSTR(sn, 7, 1) IN (1,3) THEN gen := '남자';
    END IF;
    RETURN gen;
END;
/
SELECT fnGender('0101304058829') FROM dual;

-- 주민번호에서 생일 가져오기
CREATE OR REPLACE FUNCTION fnBirth(sn IN VARCHAR)
RETURN DATE
IS
BEGIN
    IF LENGTH(sn) !=13 THEN RAISE_APPLICATION_ERROR(-20000, '주민번호는 13자리 입니다.'); END IF;
    RETURN TO_DATE(SUBSTR(sn, 1, 6), 'RRMMDD');
END;
/
SELECT fnBirth('0101304058829') FROM dual;

-- 주민번호에서 나이 가져오기
CREATE OR REPLACE FUNCTION fnAge(sn IN VARCHAR)
RETURN NUMBER
IS
    age NUMBER;
BEGIN
    IF LENGTH(sn) !=13 THEN RAISE_APPLICATION_ERROR(-20000, '주민번호는 13자리 입니다.'); END IF;
    age := TO_NUMBER(TO_CHAR(SYSDATE, 'RRRR') - TO_CHAR(fnBirth(sn), 'RRRR'));
    RETURN age;
END;
/

SELECT fnAge('9701304058829') FROM dual;

-- 트리거 사용
CREATE TABLE tr_main(id VARCHAR(1), value VARCHAR(10));
CREATE TABLE tr_sub(id VARCHAR(1), value VARCHAR(10));

CREATE OR REPLACE TRIGGER tr_main_sub
AFTER INSERT ON tr_main
FOR EACH ROW
BEGIN
    INSERT INTO tr_sub (id, value) VALUES (:NEW.id, :NEW.value);
END;
/

INSERT INTO tr_main VALUES ('1', 'TEST');
INSERT INTO tr_main VALUES ('2', 'AAAA');

SELECT * FROM tr_main;
SELECT * FROM tr_sub;

-- 수강 인원체크
CREATE TABLE stdTbl(name VARCHAR(20) NOT NULL, subject VARCHAR(10) DEFAULT 0);
CREATE TABLE subTbl(subject VARCHAR(10), cnt number(3));

CREATE OR REPLACE TRIGGER subj_chk
AFTER INSERT ON stdTbl
FOR EACH ROW
BEGIN
    UPDATE subTbl SET cnt = cnt+1 WHERE subject = :NEW.subject;
END;
/
INSERT INTO subtbl(subject) VALUES ('컴퓨터');
INSERT INTO subtbl(subject) VALUES ('디자인');
INSERT INTO stdTbl(name, subject) VALUES ('강아지', '컴퓨터');
INSERT INTO stdTbl(name, subject) VALUES ('고양이', '컴퓨터');

SELECT * FROM stdTbl;
SELECT * FROM subTbl;