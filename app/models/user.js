var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users', //reference to users table { username: 'testname', password: 'testpw'}
  hasTimestamps: true,

  initialize: function() {
    this.on('creating', function(model, attributes, options){
      const saltRounds = 10;
      const pw = req.body.password;
      bcrypt.hash(pw, saltRounds, function(err, hash) {
        console.log(hash)
        console.log(model.attributes)
        db.knex({password: hash}).into('users')
      })
      // Insert new Username
      db.knex('users').insert({username: req.body.username})
  });
}
});

module.exports = User;


//signup function
  //check db for username
   //if not in db, hash pw and store in db

//login function
  //check if username is in db
    // if so hash pw and compare to db hash