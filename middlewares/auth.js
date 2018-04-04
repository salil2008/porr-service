var config = require('../config');

module.exports = {
	isValid : function(req, res, next)	{
		try{
			if(req.headers['x-access-token'] == config.API_KEY) {
				next();
			} else {
				res.json({"statusCode": 400, "statusMessage":"Unauthorized - Invalid token"});
			}
		}
		catch(err){
			console.log(err)
			res.json({"statusCode": 400, "statusMessage":"Unauthorized - Invalid token"});
		}
	}
}