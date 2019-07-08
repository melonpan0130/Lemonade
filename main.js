var http = require('http');
var fs = require('fs');
// var url = require('url');
var ejs = require('ejs');
var express = require('express');
var bodyParser = require('body-parser');
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

app.get('/', function(request, response) {
    fs.readFile('html/main.html', 'utf8', function(error, data) {
        db.query('SELECT * FROM board ORDER BY id DESC', function(error, results) {
            response.send(ejs.render(data, {
                data:results
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
    var email = request.body.email;
    var password = request.body.password;
    db.query('SELECT pw FROM user WHERE email = ?'
    , [body.email]
    , function(error, results) {
        if(password == results.pw){ // login success
            response.cookie('auth', email);
            response.redirect('/');
        }
        else { // failed
            // alert something you wrong
            response.redirect('/SignIn');
        }
        
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