var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var geolocationSchema = new Schema({
	id : {type: Number},
	time : {type: String},
	accelerometer : {
		x : {type: String},
		y : {type: String},
		z : {type: String}
	},
	gyroscope : {
		x : {type: String},
		y : {type: String},
		z : {type: String}
	},
	coordinates : {
		lat : {type: String},
		long : {type: String}
	},
	gforce : {type: String},
	severity : {type: String},
	speed : {type: String},
	device_name : {type: String}
});

geolocationSchema.plugin(timestamps);

module.exports.geolocation = mongoose.model('geolocation', geolocationSchema);
