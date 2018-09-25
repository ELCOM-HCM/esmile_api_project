// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var user = {};
// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.username);
		console.dir('serializeUser ' + user);
	});

	// used to deserialize the user
	passport.deserializeUser(function(username, done) {
		// find user by username, receive data from database
		done(null, user);
	});
	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for
	// signup
	// by default, if there was no name, it would just be called 'local'

	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will
		// override with email
		usernameField : 'username',
		passwordField : 'password',
		passReqToCallback : true
	// allows us to pass back the entire request to the callback
	}, function(req, username, password, done) { // callback with username
													// and password from our
													// form
//		if(username == "elcom" && password == "321"){
//			user = {
//					username : 'elcom',
//					user_id: '4',
//					fullname : 'ELCOM HCM'//response.fullname,
//				}
//			return done(null, user);
//		} else {
//			return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
//		}
		request.post('http://demo.e-smile.vn:3000/tmv/login', {form: {username: username, password: password}}, 
				function(error, response, body){
					if(error){
						return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
					} else {
						var data = JSON.parse(body);
						if(data.status == null){
							user = {
									username : username,
									user_id: data.user_id,
									fullname : data.name,
								}
								return done(null, user);
						} else {
							return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
						}
						
					}
	    		});
	}));

};
