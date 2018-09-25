const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('../../config/Config'); // get our secret file
const logger = require('../../utils/Logger');

function verifyToken(req, res, next) {
  // check header or url parameters or post parameters for token
  let token = req.headers['x-access-token'];
  logger.info(token);
  if (!token) {
	  return res.status(403).send({ auth: false, message: 'You neeed to login before access this api' });
  }
  // verifies secret and checks exp
  jwt.verify(token, config.secret, function(err, decoded) {      
    if (err) {
    	return res.status(500).send({ auth: false, message: 'Login be expired.' });    
    }
    // if everything is good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });

}

module.exports = verifyToken;