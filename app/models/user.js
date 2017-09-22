var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users', //reference to users table { username: 'testname', password: 'testpw'}
  hasTimestamps: true,

  initialize: function() {
    this.on('creating', this.hashPassword)
  },

  comparePassword: function(pwTry, callback) {
    bcrypt.compare(pwTry, this.get('password'), function(err, matching){
      callback(matching)
    })
  },

  hashPassword: function() {
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.get('password'), null, null).bind(this)
    .then(function(hash) {
      this.set('password', hash);
    });
  }
});

module.exports = User;
