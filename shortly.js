var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
// var session = require('express-sessions');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.use(session({
//   secret: 'secret',
//   resave: false,
//   saveUninitialized: true,
// }));

app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/',
  function(req, res) {
    // console.log('session', req.session);
    // if (req.session.loggedIn) {
    //   res.render('index')
    // }
    res.render('login');
  });

app.get('/login',
  function(req, res) {
    res.render('login');
  });

app.get('/signup',
  function(req, res) {
    res.render('signup');
  });

app.get('/logout',
  function(req, res) {
    res.render('login');
  });

app.get('/create',
  function(req, res) {
    res.render('index');
  });

app.get('/links',
  function(req, res) {
    Links.reset().fetch().then(function(links) {
      res.status(200).send(links.models);
    });
  });

app.post('/links',
  function(req, res) {
    var uri = req.body.url;
    if (!util.isValidUrl(uri)) {
      console.log('Not a valid url: ', uri);
      return res.sendStatus(404);
    }

    new Link({ url: uri }).fetch().then(function(found) {
      if (found) {
        res.status(200).send(found.attributes);
      } else {
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }

          Links.create({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          })
            .then(function(newLink) {
              res.status(200).send(newLink);
            });
        });
      }
    });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  //chek if username is in db
  // db.knex.select(req.body.username).from('users')
  //   .then(function(data) {
  //     console.log(data);
  //   })
  //   .catch(function(err) {
  //     console.log('There was an err', err);
  //   });

  new User({username: req.body.username, password: req.body.password}).fetch()
      .then(function(found) {
        //check if name is found in db
        if(!found){
          res.redirect('/login');
        } else {
          bcrypt.compare(password, user.get('password'), function(err, match) {
            if(match) {
              util.createSession(req, res, user)
            } else {
              res.redirect('/login');
            }
          });
        }
      });
  // check hashed password with input password
  // const pw = req.body.password
  // Request hash from DB
  // bcrypt.compare(pw, hash, function(err, res) {
    // res === true
    // if true
    // redirect to links page
  // });
  // redirect to links page
});

app.post('/signup', function(req, res) {
  new User({username: req.body.username, password: req.body.password}).fetch()
  .then(function(found) {
    //check if name is found in db
    if(found){
      console.log('user exists');
      res.redirect('login');
    } else {
      var newUser = new User({username: req.body.username, password: req.body.password})
      newUser.save()
        .then(function(newUser){
          util.createSession(req, req, newUser)
        })
    }
  })
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
