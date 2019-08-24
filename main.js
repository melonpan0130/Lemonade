var http = require('http');
var fs = require('fs');
// var url = require('url');
var ejs = require('ejs');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var userId = null;
var userName = null;

// connect oracle DB
var oracle = require('oracledb'); // oracle 연동
var db;
oracle.autoCommit = true;

oracle.getConnection({ 
    user     : 'LEMON', // lemon 사용자
    password : '1234', // 비밀번호
    connectString : '127.0.0.1' // host
}, function(err, conn) { 
    if(err)
        console.log(err);
    db = conn;
});

// app setting
var app = express();
app.set('view engine', 'jade'); // 기본 파일로 jade를 사용
app.set('views', './jade'); // jade폴더 안의 뷰를 사용
app.locals.pretty = true; 

app.use(bodyParser.urlencoded({
    extended: false 
})).listen(3000, function() {
    console.log('Success');
});
app.use(cookieParser());

// '/'로 접근했을 때
app.get('/', function(request, response) {
    db.execute('SELECT * FROM BOARD ORDER BY CREATETIME DESC'
    , []
    , function(error, results) {
        if(error)
            console.log(error);
        userId = request.cookies.userId;
        userName = request.cookies.userName;
        
        response.render('main', {
            data: results.rows, // DB값을 보냄
            userId : userId,
            userName : userName
        });
    });
});

// Sign up
app.get('/SignUp', function(request, response) {
    response.render('SignUp');
});

app.post('/SignUpProc', function(request, response) {
    var body = request.body;
    db.execute('INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES (:1, :2, :3)'
    , [body.name, body.email, body.pw]
    , function(error, results) {
        response.redirect('/'); 
    });
});

// Sign in
app.get('/SignIn', function(request, response) {
    response.render('SignIn');
});

// Sign in의 결과를 처리
app.post('/SignInProc', function(request, response) {
    var body = request.body;
    db.execute('SELECT * FROM adeuser WHERE email = :1'
    , [body.email]
    , function(error, results) {
        console.log(results.rows);
        if(results.rows != [] && body.pw == results.rows[0][3]) { 
            // 로그인 성공!
            response.cookie('userId', results.rows[0][0]);
            response.cookie('userName', results.rows[0][1]);
            
            response.redirect('/');
        }
        else 
        {  // 로그인 실패!
            response.redirect('/SignIn'); // 다시 되돌려 보냄
        }
    });
});

app.get('/logout/:userId', function(request, response) {
    response.clearCookie('userId');
    response.clearCookie('userName');

    userId = null;
    userName = null;

    response.redirect('/');
});

// myPage
app.get('/myPage/:id', function(request, response) {
    db.execute('SELECT * FROM board WHERE userId = :1 ORDER BY createtime DESC'
    , [request.params.id]
    , function(error, results) {
        response.render('myPage', {
            data: results.rows, // DB값을 보냄
            userName: userName
        });
    });
});

// add board
app.get('/insert', function(request, response) {
    response.render('insertBoard');
})

// insert board proc
app.post('/insert', function(request, response) {
    var body = request.body;
    db.execute('SELECT COUNT(*) FROM board WHERE userId = :1'
    , [userId]
    , function(error, id) { 
        // boardid값을 설정하는 것이 목적.
        // 같은 사용자 내에서만 숫자가 증가하도록 설정. -> make function later
        db.execute('INSERT INTO board (userId, id, title, content) VALUES (:1, :2, :3, :4)'
        , [userId, (id.rows[0][0]+1), body.title, body.content]
        , function(error, results) {
            response.redirect('/myPage/'+userId);
            console.log('title');
            console.log(body.title);
            console.log('content');
            console.log(body.content);
        }); // insert
    });
});

app.get('/lemon/:userId/:boardId', function(request, response) {
    var userId = request.params.userId; // url에서 userId값 추출
    var boardId = request.params.boardId; // url에서 boardId값 추출

    db.execute('SELECT * FROM board WHERE userId = :1 AND id = :2'
    , [userId, boardId]
    , function(error, board) {
        /*
    select c.id, a.name, c.content
  2  from comments c
  3  right join adeuser
  4  a
  5  on a.id=c.writerid
  6  where c.id = 24;
  */
        db.execute('SELECT * FROM comments WHERE userId = :1 AND boardId = :2 ORDER BY id DESC'
        , [userId, boardId]
        , function(error2, comments) {
            console.log(comments);
            
            db.execute('SELECT name FROM adeuser WHERE id = :1'
            , [board.rows[0][0]]
            , function(error3, username) {

                response.render('lemon', {
                    data : board.rows[0],
                    userId : request.cookies.userId,
                    name : username.rows[0][0],
                    comment : comments.rows,
                });
            });
        });
    });
})


// update board
app.get('/updateBoard/:id', function(request, response) {
    db.execute('SELECT * FROM board WHERE userid = :1 AND id = :2'
    , [userId, request.params.id]
    , function(error, results) {
        response.render('updateBoard', {
            title : results.rows[0][2],
            content : results.rows[0][3]
        });
    });
});

// 
app.post('/updateBoard/:id', function(request, response) {
    var body = request.body;
    db.execute('UPDATE board SET title = :1, content = :2 WHERE userid = :3 and id=:4'
    , [body.title, body.content, userId, request.params.id]
    , function(error, results) {
        response.redirect('/myPage/'+userId);
    });
});

// delete board
app.get('/deleteBoard/:boardId', function(request, response) {
    var boardid = request.params.boardId;
    db.execute('DELETE FROM board WHERE userId = :1 AND id = :2'
    , [userId, boardid]
    , function(error, results) {
        // 이전페이지로 이동시키기
        console.log('delete');
        // response.redirect('/');
        response.redirect('/myPage/'+userId);
    });
});

// comment 댓글 달기
app.post('/comment/:id/:boardId', function(request, response) {
    var body = request.body;
    var params = request.params;
    
    db.execute('INSERT INTO comments(userId, boardId, writerId, content) VALUES(:1, :2, :3, :4)'
    ,[params.id, params.boardId, userId, body.comment]
    , function(error, results) {
        // history.go(-1);
        response.redirect('/lemon/'+params.id+'/'+params.boardId);
    })
});

// DeleteComment 댓글 삭제
app.get('/DeleteComment/:id/:boardId/:commentId', function(request, response) {
    var params = request.params;
    db.execute('DELETE FROM comments WHERE userId = :1 AND boardId = :2 AND id = :3'
    , [params.id, params.boardId, params.commentId]
    , function(error, results) {
        response.redirect('/lemon/'+params.id+'/'+params.boardId);
    });
})