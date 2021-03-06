﻿/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'),
	path = require('path'),
	override = require('method-override'),
	bodyParser = require('body-parser'),
	logger = require('express-logger'),
	expressErrorHandler = require("express-error-handler"),
	routes = require('./routes'),
	test = require('./routes/test.js'),
	newtest = require('./routes/newtest.js'),
	app = express(),
	server;

// all environments
app.set('port', process.env.PORT || 1337);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger({
	path: 'logs/log.txt'
}));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Start sequelize
 */

var Sequelize = require('sequelize'), sequelize = new Sequelize('postgres', 'xamulatoradmin', 'xamulatorswag', {
	host: "xamulatordb.c626h2danuwm.us-west-2.rds.amazonaws.com",
	port: 5432,
	dialect: "postgres"
});
// Objects to use with Sequelize
var Test = sequelize.define('Test', {
	id: {type: Sequelize.INTEGER, allowNull: false, autoIncrement: true},
	name: {type: Sequelize.STRING, allowNull: false},
	points: Sequelize.INTEGER,
	testDate: Sequelize.DATE,
	available: {type: Sequelize.BOOLEAN, defaultValue: false},
	randomized: {type: Sequelize.BOOLEAN, defaultValue: false} 
});
var Question = sequelize.define('Question', {
	type: {type: Sequelize.STRING, allowNull: false},
	content: Sequelize.TEXT,
	answers: Sequelize.TEXT,
	correct: Sequelize.TEXT,
	correctAnswerPoints: Sequelize.INTEGER,
	noAnswerPoints: Sequelize.INTEGER,
	wrongAnswerPoints: Sequelize.INTEGER,
	random: Sequelize.BOOLEAN
});
Test.hasMany(Question);
Question.belongsTo(Test);

var User = sequelize.define("User", {
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	classes: Sequelize.ARRAY(Sequelize.INTEGER),
	scores: Sequelize.TEXT
});
var Classes = sequelize.define("Class", {
	name: Sequelize.TEXT
});
Classes.hasOne(User, {as: "admin"});
Classes.hasMany(User, {as: "student"});

Classes.hasMany(Test);
Test.belongsTo(Classes);
// END SEQUELIZE

/** 
 * all functions and code definitions go below
 */
function convertDatetimeToPostgresql(date){
	return date.toISOString().slice(0, 19).replace("T", " ");
}
function shuffle(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

function log(msg) {
	if (console !== undefined && msg !== undefined) {
		console.log(msg);
	}
}



app.get('/', routes.index);
app.get('/test', test.index);
app.get('/newtest', newtest.index);
app.post('/newtest', function(request, response) {
	response.set("Access-Control-Allow-Origin", "*");
	log(request.body);
	var body = JSON.parse(request.body);
	Test.create({
		name: body.test.name, 
		points: parseInt(body.test.points), 
		testDate: convertDatetimeToPostgresql(new Date(body.test.time)),
		randomized: parseInt(0)
	});
	body.questions.forEach(function(e) {
		Question.create({
			type: e.type, 
			content: e.content, 
			answers: e.answers, 
			correct: e.correct,
			correctAnswerPoints: (parseInt(e.correctAnswerPoints) != NaN ? null : parseInt(e.correctAnswerPoints)),
			noAnswerPoints: (parseInt(e.noAnswerPoints) != NaN ? null : parseInt(e.noAnswerPoints)), 
			wrongAnswerPoints: (parseInt(e.wrongAnswerPoints) != NaN ? null : parseInt(e.wrongAnswerPoints)), 
			random: parseInt(e.random)
		}); 
	});


	//Redirect user to a finsh page - NEEDS TO BE IMPLEMENTED
	response.writeHead(301, {Location: "http://localhost:1337"});
	response.end();
	log("done");
});
app.post('/modifytest', function(request, response) {
	//Receives a JSON object that must include two selectors: modify, remove

	var body = JSON.parse(request.body);
	//if (body.modify.)

})
app.post('/edittest', function(request, response) {
	//Allows teacher to edit an already created test
	response.set("Access-Control-Allow-Origin");
	var body = JSON.parse(request.body);
	test = Test.find({where: {id: body.id} }).success(function(project){

	})

})

app.post("/login/", function(request, response) {


	
	request.body.username;
	request.body.password;

});
// Get test questions
app.post("/taketest/", function(req, res) {

	res.set("Access-Control-Allow-Origin", "*");
	var body = req.body;
		

});
// Check test status
app.post("/checkstatus/", function(req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var body = req.body;
	
});
app.post("/gradetest/", function(req, res) {
	var body = req.body;
	// Get answers
	var answerArr = [];

	// Get student responses <-- implement after we manage to store student responses somehow.
	var studentRes = ["foo", "bar"];
	// populate array with T or F based on correct/incorrect
	var corrections = [];
	for (var i = 0; i < studentRes.length; i++) {
		if (e[i] == answerArr[i].correctAnswer) {
			corrections[i] = true;
		} else if (e[i] == null) {
			corrections[i] = null;
		} else {
			corrections[i] = false;
		}
	}
	// Add up all the points and store into DB.
	var totalPoints = 0;
	for (var i = 0; i < corrections.length; i++) {
		if (corrections[i]) {
			totalPoints += answerArr[i].fullPoints;
		} else if (corrections[i] == null) {
			totalPoints += answerArr[i].noAnswerPoints;
		} else {
			totalPoints -= answerArr[i].wrongAnswerPoints;
		}
	}
	// Mock storing into DB
	/*
	 * connection.query("INSERT INTO TABLE ??? VALUES (" + connection.escape(totalPoints) + ", " + connection.escape(body.studentId) + ")");
	 */
});

server = http.createServer(app);
// development only
// if ('development' == app.get('env')) {
// app.use(expressErrorHandler({server: server}));
// }

server.listen(app.get("port"), function() {
	console.log("Express server listening on port " + app.get("port"));
});