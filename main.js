var http = require('http');
var fs = require('fs');
// var url = require('url');
var ejs = require('ejs');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var isLogin = false;
var userId = null;
var userName = null;

// connect oracle DB
var oracle = require('oracledb');
var db;
oracle.autoCommit = true;
oracle.getConnection({
    user     : 'LEMON',
    password : '1234',
    connectString : '127.0.0.1'
}, function(err, conn) { 
    if(err){
        console.log('DB error', err);
    }
    db = conn;
});

// app setting
var app = express();
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;

app.use(bodyParser.urlencoded({
    extended: false 
})).listen(3000, function() {
    console.log('Success');
});

app.use(cookieParser());

app.get('/', function(request, response) {
    db.execute('SELECT * FROM BOARD ORDER BY CREATETIME DESC'
    , []
    , function(error, results) {
        if(error)
            console.log(error);
        
        response.render('main', {
            data: results.rows,
            isLogin : isLogin,
            userId : userId,
            userName : userName
        });
        console.log(results);
    });
});

app.get('/SignUp', function(request, response) {
    response.render('SignUp');
});

app.post('/SignUpProc', function(request, response) {
    var body = request.body;
    db.execute('INSERT INTO ADEUSER (NAME, EMAIL, PW) VALUES (:1, :2, :3)'
    , [body.name, body.email, body.pw]
    , function(error, results) {
        console.log('sign up');
        console.log(request.body.name);
        console.log(request.body.email);
        console.log(request.body.pw);
        console.log(results);
        response.redirect('/');
    });
});
/*
app.post('/SignUpProc', function(request, response) {
    var body = request.body;
    db.query('INSERT INTO user (name, email, pw) VALUES (?, ?, ?)'
    , [body.name, body.email, body.pw]
    , function(error, results) {
        response.redirect('/');
    });
});

// sign in
app.get('/SignIn', function(request, response) {
    fs.readFile('html/SignIn.html', 'utf8', function(error, results) {
        response.send(results);
    });
});

app.post('/SignInProc', function(request, response) {
    var body = request.body;
    var email = body.email;
    db.query('SELECT id, pw, name FROM user WHERE email = ?'
    , [email]
    , function(error, results) {
        if(body.pw == results[0].pw){ // login success
            // alert you succeed
            response.cookie('userEmail', email);
            response.cookie('userId', results[0].id);
            response.cookie('userName', results[0].name);
            userId = request.cookies.userId;
            userName = request.cookies.userName;
            isLogin = true;

            response.redirect('/');
        }
        else { // failed
            // alert something you wrong
            response.redirect('/SignIn');
        }
    });
});

// mypage
app.get('/myPage/:id', function(request, response) {
    fs.readFile('html/myPage.html', 'utf8', function(error, data) {
        db.query('SELECT * FROM board WHERE userId = ? ORDER BY id DESC'
        , [request.params.id]
        , function(error, results) {
            response.send(ejs.render(data, {
                userName : userName,
                data : results
            }));
        });
    });
});

// add board in mypage ; /insert/userId
app.get('/insert', function(request, response) {
    fs.readFile('html/insertBoard.html', 'utf8'
    , function(error, data) {
        response.send(data);
    });
});

app.post('/insert', function(request, response) {
    var body = request.body;

    db.query('INSERT INTO board (userId, title, content) VALUES (?, ?, ?)'
    , [userId, body.title, body.content]
    , function(error, data) {
        response.redirect('/myPage/'+userId);
    });
});

// edit board in mypage ; /edit/boardId
app.get('/update/:id', function(request, response) {
    fs.readFile('html/updateBoard.html', 'utf8'
    , function(error, data) {
        db.query('SELECT * FROM board WHERE userid = ? AND id = ?'
        , [userId, request.params.id]
        , function(error, results) {
            response.send(ejs.render(data, {
                data : results[0]
            }));
        });
    });
});

app.post('/update/:id', function(request, response) {
    var body = request.body;

    db.query('UPDATE board SET title = ?, content = ? WHERE id = ?'
    , [body.title, body.content, request.params.id]
    , function(error, data) {
        response.redirect('/myPage/'+userId);
    });
}); 

// delete board in mypage ; /delete/boardId
app.get('/delete/:id', function(request, response) {
    db.query('DELETE FROM board WHERE userId = ? AND id = ?'
    , [userId, request.params.id]
    , function(){
        response.redirect('/myPage/'+userId);
    });
});

// connect to board ; /lemon/userId/boardId
app.get('/lemon/:userId/:boardId', function(request, response) {
    var userId = request.params.userId;
    var boardId = request.params.boardId;
    fs.readFile('html/lemon.html', 'utf8', function(error, data){
        db.query('SELECT * FROM board WHERE userId = ? AND id = ?'
        , [userId, boardId]
        , function(err, content) {
            db.query('SELECT * FROM comment WHERE userId = ? AND boardId = ?'
            , [userId, boardId]
            ,function(err2, comments) {
                console.log(err2);
                console.log(comments);
                response.send(ejs.render(data, {
                    comment : comments,
                    data : content[0]
                }));
            });
        });
    });
});

app.get('/deleteComment/:userId/:boardId/:commentId', function(request, response) {
    var userId = request.params.userId;
    var boardId = request.params.boardId;
    var commentId =  request.params.commentId;
    console.log('userID : '+userId);
    console.log('boardId : '+boardId);
    console.log('commentId : '+commentId);
    db.query('DELETE FROM comment WHERE userId = ? AND boardId = ? AND id = ?'
    , [userId, boardId, commentId]
    ,function(error, data) {
        console.log(data);
    });
});

*/