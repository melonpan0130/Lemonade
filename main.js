var http = require('http');
var fs = require('fs');
// var url = require('url');
var ejs = require('ejs');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var isLogin = false;
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
        db.query('SELECT * FROM board ORDER BY id DESC', function(error, results) {
            
            response.send(ejs.render(data, {
                data : results,
                isLogin : isLogin,
                userId : (isLogin) ? request.cookies.userId : null
            }));
            
            // console.log('isLogin : '+typeof(response.cookies.userEmail));
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
                data:results
            }));
        });
    });
})

// add board in mypage ; /insert/userId
app.get('/insert', function(request, response) {
    fs.readFile('html/insertBoard.html', 'utf8'
    , function(error, data) {
        response.send(data);
    });
});

app.post('/insert', function(request, response) {
    var body = request.body;
    var userId = request.cookies.userId;

    db.query('INSERT INTO board (userId, content) VALUES (?, ?)'
    , [userId, body.content]
    , function(error, data) {
        response.redirect('/myPage/'+userid);
    });
});

// edit board in mypage ; /edit/boardId
app.get('/update/:id', function(request, response) {
    var body = request.body;

    db.query('UPDATE board SET content = ?', []);
});

// delete board in mypage ; /delete/boardId
app.get('/delete/:id', function(request, response) {
    db.query('DELETE FROM board WHERE id = ?', [request.params.id]
    , function(){
        response.redirect('/');
    });
});

// connect to board ; /lemon/userId/boardId
app.get('/lemon/:id/:id', function(request, response) {
    db.query('');
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