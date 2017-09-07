'use strict';
/* Index.js */

//modules
const express = require('express');
const app = express();
const fs = require('fs');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const port = process.env.PORT || 8000;

// database setup
let db = require('origindb')('config/db');
const dateformat = require('dateformat');

let getSports = function() {
  let files = fs.readdirSync('config/db');
  let sports = {};
  for (var i = 0; i < files.length; i++) {
    let sport = files[i].substring(0, files[i].length - 5);
    sports[sport] = sport;
  }
  return sports;
}
const sports = getSports();

let createGame = function (sport, opponent, month, day, time) {
  month = Number(month);
  day = Number(day);
  if (isNaN(month) || isNaN(day)) return;
  if (!sports[sport]) return;
  let year = 2017;
  if (month < 7) year++;
  let date = new Date(year, month - 1, day);
  let id = uuid();
  db(sport).set(id, {
    'opponent': opponent,
    'date': date.valueOf(),
    'cleanDate': dateformat(date, "dddd, mmmm dS, yyyy"),
    'time': time,
    'dhsScore': '---',
    'oppScore': '---',
    'link': ''
  });
  return true;
};

let mostRecentScores = function() {
  let response = {};
  for (let sport in sports) {
    let gameSet = db(sport).object();
    let games = Object.keys(gameSet);
    if (!games) continue;
    games.sort((a, b) => {return gameSet[b]['date'] - gameSet[a]['date']; });
    response[sport] = db(sport).get(games[games.length - 1]);
  }
  return response;
};

// Middleware
app.use(compression());
app.use(helmet());
app.use(cors());
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/edit', (req, res) => {
  res.redirect('/');
});

app.get('/recent', (req, res) => {
  res.send(JSON.stringify(mostRecentScores()));
});

app.post('/edit', (req, res) => {
  if (!req.body.password || req.body.password != 'NewsNeverSleeps') { //the most secure of validation
    res.redirect('/');
    return;
  }
  let output = `<ul>`;
  Object.keys(sports).forEach(sport => {
    output += `<li class="sport"><button class="btn btn-success sport-choice" id=${sport}>${sport}</button></li>`;
  });
  output += `</ul>`;
  res.render('editor', {sportList: output});
});

app.post('/games', (req, res) => {
  let sport = req.body.sport;
  res.send(JSON.stringify(db(sport).object()));
});

app.post('/edit/update', (req, res) => {
  if (!db(req.body['sport']) || !db(req.body['sport']).get(req.body['id'])) {
    res.send('Error: game or sport not found');
  }
  let data = db(req.body['sport']).get(req.body['id']);
  data['opponent'] = req.body.opponent;
  if (req.body.dhsScore.length > 0) data['dhsScore'] = req.body.dhsScore;
  if (req.body.oppScore.length > 0) data['oppScore'] = req.body.oppScore;
  data['link'] = req.body.link;
  db(req.body['sport']).object()[req.body['id']] = data;
  db.save();
  res.redirect('/');
});

app.post('/edit/add', (req, res) => {
  let success = createGame(req.body.sport, req.body.opponent, req.body.month, req.body.day, req.body.time);
  if (success) {
    res.redirect('/');
  } else {
    res.send("Your submission could not be processed. Please make sure you've filled everything out correctly.");
  }
});

// Make it happen!
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});