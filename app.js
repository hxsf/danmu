var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var wechat = require('wechat');
var config = require('./config.json');

/**
 * Create HTTP/HTTPS server.
 */
var server = http.Server(app);
/**
 * Get ssl.
 */
// var options = {
// 	key: fs.readFileSync('./ssl/private.pem'),
// 	cert: fs.readFileSync('./ssl/cert.pem')
// };
// var server = https.createServer(options, app).listen(443);
var io = require('socket.io')(server);

server.listen(80);

io.on('connection', function (socket) {
	socket.on('my other event', function (data) {
		console.log(data);
	});
});

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/new', function(req, res, next) {
    io.emit('news', {type: 'text', content: 'a new word', vip: 1});
    res.send('ok');
});

app.use(express.query());
app.use('/wechat', wechat(config, function (req, res, next) {
	// message is located in req.weixin
	var message = req.weixin;
	console.log(message);
	switch (message.MsgType) {
		case 'text':
			res.reply({content: 'got it', type: 'text'});
			io.emit('news', {type: 'text', content: message.Content, vip: message.FromUserName==='oXPj5s7ix5NHBMBENWYHBb3Yx7xY'?1:0});
			break;
		case 'image':
			res.reply({content: 'got it', type: 'text'});
			// io.emit('news', {type: 'image', url: message.PicUrl});
			break;
		case 'voice':
			if (message.Recognition === '') {
				res.reply({content: '你在说什么，我听不清。', type: 'text'});
			} else {
				res.reply({content: '我好像听到你说：'+message.Recognition, type: 'text'});
			}
			break;
		case 'video':
			res.reply({content: '还看不懂你发的视频', type: 'text'});
			break;
		case 'shortvideo':
			res.reply({content: '还看不懂你发的视频', type: 'text'});
			break;
		case 'location':
			res.reply({content: '你在'+message.Label+'附近', type: 'text'});
			break;
		case 'link':
			res.reply({content: '哥哥告诉我，不要随便点别人发的链接', type: 'text'});
			break;
		case 'event':
			res.reply();
			break;
		default:
	}
}));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
} else {
	// production error handler
	// no stacktraces leaked to user
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
}
