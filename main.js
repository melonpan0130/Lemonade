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

app.post('/SignInProc', function(request, response) {
    var body = request.body;
    var email = body.email;
    db.execute('SELECT * FROM adeuser WHERE email = :1'
    , [email]
    , function(error, results) {
        if(body.pw == results.rows[0][3]) 
        { // login success
            // alert succeed!
            response.cookie('userEmail', email);
            response.cookie('userId', results.rows[0][0]);
            response.cookie('userName', results.rows[0][1]);
            userId = request.cookies.userId;
            userName = request.cookies.userName;
            isLogin = true;
            
            response.redirect('/');
        }
        else 
        { // fail to log in
            // alert something you wrong
            response.redirect('/SignIn');
        }
        
    });
});

// myPage
app.get('/myPage/:id', function(request, response) {
    console.log('mypage');
    db.execute('SELECT * FROM board WHERE userId = :1 ORDER BY createtime'
    , [request.params.id]
    , function(error, results) {
        response.render('myPage', {
            data: results.rows,
            userName: userName
        });
        console.log(results);
    });
});

// add board
app.get('/insert', function(request, response) {
    response.render('insertBoard');
})

app.post('/insert', function(request, response) {
    
});

/*
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