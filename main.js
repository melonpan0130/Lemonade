var http = require('http');
var fs = require('fs');
// var url = require('url');
var ejs = require('ejs');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var isLogin = false;
var userId = null;

var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'studynodejs'
});
db.connect();

var app = express();
app.use(bodyParser.urlencoded({
    extended: false 
})).listen(3000, function() {
    console.log('Success');
});

app.use(cookieParser());

app.get('/', function(request, response) {
    fs.readFile('html/main.html', 'utf8', function(error, data) {
        userId = (isLogin) ? request.cookies.userId : null

        db.query('SELECT * FROM board ORDER BY id DESC', function(error, results) {
            response.send(ejs.render(data, {
                data : results,
                isLogin : isLogin,
                userId : userId
            }));
        });
    });
});

// sign up
app.get('/SignUp', function(request, response) {
    fs.readFile('html/SignUp.html', 'utf8', function(error, results) {
        response.send(results);
    });
});

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
    db.query('SELECT id, pw FROM user WHERE email = ?'
    , [email]
    , function(error, results) {
        if(body.pw == results[0].pw){ // login success
            // alert you succeed
            response.cookie('userEmail', email);
            response.cookie('userId', results[0].id);
            userId = request.cookies.userId;
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
                response.send(ejs.render(data, {
                    data : content[0],
                    comment : comments
                }));

                console.log(comments);
            });
        });
    });
});


/*
http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
        if(queryData.id === undefined){
            fs.readFile('hello.html', function(err, result){
                response.writeHead(200, {'Content-Type' : 'text/html'});
                response.end(result);
            });
        } else {
            fs.readFile('hello2.html', function(err, result){
                response.writeHead(200, {'Content-Type' : 'text/html'});
                response.end(result);
            })
        }
    }
}).listen(3000, function() {
    console.log('running');
});
*/