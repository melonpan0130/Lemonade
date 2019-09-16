var http = require('http');
var fs = require('fs');
// var url = require('url');
var ejs = require('ejs');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

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
app.set('view engine', 'pug'); // 기본 파일로 pug를 사용
app.set('views', './views'); // views 폴더 안의 뷰를 사용
app.locals.pretty = true; 

app.use(bodyParser.urlencoded({
    extended: false 
})).listen(3000, function() {
    console.log('Success');
});
app.use(cookieParser());

// upload images
app.get('/images/:filename', (req, res) => {
    fs.readFile('./images/'+req.params.filename, (error, data) => {
      res.writeHead(200, { 'Content-Type': 'image/png'});
      res.end(data);
    })
});

/* Create new image 
app.post('saveimg/:filename', function(req, res, next) {
    upload(req, res).then(function (file) {
      res.json(file);
    }, function (err) {
      res.send(500, err);
    });
});

var upload = function (req, res) {
    var deferred = Q.defer();
    var storage = multer.diskStorage({
      // 서버에 저장할 폴더
      destination: function (req, file, cb) {
        cb(null, imagePath);
      },
  
      // 서버에 저장할 파일 명
      filename: function (req, file, cb) {
        file.uploadedFile = {
          name: req.params.filename,
          ext: file.mimetype.split('/')[1]
        };
        cb(null, file.uploadedFile.name + '.' + file.uploadedFile.ext);
      }
    });
  
    var upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
      if (err) deferred.reject();
      else deferred.resolve(req.file.uploadedFile);
    });
    return deferred.promise;
};
*/

// '/'로 접근했을 때
app.get('/', function(request, response) {
    db.execute(
        'SELECT B.USERID, B.BOARDID, B.TITLE, B.CONTENT, B.NAME, (SELECT COUNT(*) FROM HEART HE WHERE HE.USERID=B.USERID AND HE.BOARDID=B.BOARDID) AS LIKED, (SELECT COUNT(*) FROM HEART HE WHERE HE.USERID=B.USERID AND HE.BOARDID=B.BOARDID AND HE.LIKEID = :1) AS ISLIKE FROM BOARDINFO B'
    , [request.cookies.userId]
    , function(error, board) {
        userId = request.cookies.userId;
        userName = request.cookies.userName;

        response.render('main', {
            board: board.rows, // DB값을 보냄
            /*
            0 USERID
            1 BOARDID
            2 TITLE
            3 CONTENT
            4 USERNAME
            5 LIKED COUNT
            6 Is like? 내가 좋아요를 눌렀는가??
            */
            userId : userId,
            userName : userName
        });
    });
});

// search product
app.post('/', function(request, response) {
    var option = request.body.option;
    var where;

    if(option == 'all') where = 'UPPER(B.name) = UPPER(:2) OR UPPER(B.title) = UPPER(:2)';
    // else if(option == 'product') where = 'item = :1'; // make item culumn later..
    else if(option == 'seller') where = 'UPPER(B.name) = UPPER(:2)';
    else if(option == 'title') where = 'UPPER(B.title) = UPPER(:2)';

    db.execute('SELECT B.USERID, B.BOARDID, B.TITLE, B.CONTENT, B.NAME, (SELECT COUNT(*) FROM HEART HE WHERE HE.USERID=B.USERID AND HE.BOARDID=B.BOARDID) AS LIKED, (SELECT COUNT(*) FROM HEART HE WHERE HE.USERID=B.USERID AND HE.BOARDID=B.BOARDID AND HE.LIKEID = :1) AS ISLIKE FROM BOARDINFO B WHERE '+where+' ORDER BY CREATETIME DESC'
    , [request.cookies.userId, request.body.search]
    , function(error, results) {
        if(error)
            console.log(error);
        userId = request.cookies.userId;
        userName = request.cookies.userName;
        console.log(where);
        console.log(request.body.search);
        console.log(results);
        response.render('main', {
            board: results.rows, // DB값을 보냄
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
        console.log(results);
        if(body.pw == results.rows[0][3]) { 
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
    var myid = request.params.id;
    // 내 게시물 조회
    db.execute('SELECT * FROM board WHERE userId = :1 ORDER BY createtime DESC'
    , [myid]
    , function(error1, results) {
        // 위시 리스트 조회
        db.execute('SELECT b.userid, b.boardid, he.heartid, title, content, price FROM BOARD b, HEART he WHERE b.BOARDID=he.boardid AND b.userid = he.USERID AND he.LIKEID= :1'
        , [myid]
        , function(error2, wishlist) {

            db.execute('SELECT FROM '
            , [myid]
            , function(error3, buylist) {
                response.render('myPage', {
                    data: results.rows, // 내가 올린 게시물
                    userName: request.cookies.userName,
                    wish: wishlist.rows // 장바구니 정보
                    /*
                    [0] : userId
                    [1] : boardid
                    [2] : heartId
                    [3] : title
                    [4] : content
                    [5] : price
                    */ 
                });
            });
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
        db.execute('INSERT INTO board (userId, boardid, title, content, img) VALUES (:1, :2, :3, :4, :5)'
        , [userId, (id.rows[0][0]+1), body.title, body.content, body.img]
        , function(error, results) {
            response.redirect('/myPage/'+userId);
            console.log('insert');
            console.log(body.title);
            console.log(body.img);
        }); // insert
    });
});

app.get('/lemon/:userId/:boardId', function(request, response) {
    var userId = request.params.userId; // url에서 userId값 추출
    var boardId = request.params.boardId; // url에서 boardId값 추출

    db.execute('SELECT * FROM board WHERE userId = :1 AND boardid = :2'
    , [userId, boardId]
    , function(error, board) {
        db.execute('SELECT c.commentid, a.name, c.content, a.userid FROM comments c RIGHT JOIN adeuser a ON a.userid = c.writerid WHERE c.boardid = :1 ORDER BY c.commentid DESC'
        , [boardId]
        , function(error2, comments) {
            db.execute('SELECT name FROM adeuser WHERE userid = :1'
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
    db.execute('SELECT * FROM board WHERE userid = :1 AND boardid = :2'
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
    db.execute('UPDATE board SET title = :1, content = :2 WHERE userid = :3 and boardid=:4'
    , [body.title, body.content, userId, request.params.id]
    , function(error, results) {
        response.redirect('/myPage/'+userId);
    });
});

// delete board
app.get('/deleteBoard/:boardId', function(request, response) {
    var boardid = request.params.boardId;
    db.execute('DELETE FROM board WHERE userId = :1 AND boardid = :2'
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
    db.execute('DELETE FROM comments WHERE userId = :1 AND boardId = :2 AND commentid = :3'
    , [params.id, params.boardId, params.commentId]
    , function(error, results) {
        response.redirect('/lemon/'+params.id+'/'+params.boardId);
    });
})

// 장바구니 추가
app.get('/heart/:userId/:boardId', function(request, response) {
    // cookie!
    var userId = request.params.userId;
    var boardId = request.params.boardId;

    db.execute('INSERT INTO heart(userid, boardid, likeid) VALUES (:1, :2, :3)'
    , [userId, boardId, request.cookies.userId]
    , function(error, hearts) {
        response.redirect('/lemon/'+userId+'/'+boardId);
    });
});

// 장바구니 상품 삭제
app.get('/deleteHeart/:userId/:boardId', function(request, response) {
    var params = request.params;
    var myid = request.cookies.userId;
    db.execute('DELETE FROM heart WHERE userid = :1 AND boardid = :2 AND likeid = :3'
    , [params.userId, params.boardId, myid]
    , function(error, result) {
        response.redirect('/myPage/'+myid);
    });
});

app.post('/addBuy', function(request, response) {
    // request.body.
    var wish = request.body.wish;
    var myid = request.cookies.userId;

    if(typeof(wish)==Array) // wish가 배열일 때
        wish.map((item, index)=> { // for문은 비동기로 작동하기 때문에 map()함수 사용
            db.execute('INSERT INTO receipt(userid, boardid, buyer, price) SELECT userid, boardid, likeid, price FROM subreceipt WHERE heartid = :1 AND likeid = :2'
            , [item, myid]
            , (error2, result)=>{
                if(error2)
                    console.log(error2);
            });

            // delete from heart
            db.execute('DELETE FROM heart WHERE heartid = :1 AND likeid = :2'
            , [item, myid]
            , ()=>{});
        });
    else { // wish가 1개일 때
        db.execute('INSERT INTO receipt(userid, boardid, buyer, price) SELECT userid, boardid, likeid, price FROM subreceipt WHERE heartid = :1 AND likeid = :2'
        , [wish, myid]
        , (error2, result)=>{
            if(error2)
                console.log(error2);
        });

        // delete from heart
        db.execute('DELETE FROM heart WHERE heartid = :1 AND likeid = :2'
        , [wish, myid]
        , ()=>{});
    }

    response.redirect('/myPage/'+myid);
});