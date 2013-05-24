var db = require('./dbConnector').db;

module.exports = {
	findOne: function (query, callback) {
		return db.subscribers.findOne(query, callback);
	},
	findAll: function (callback) {
		return db.subscribers.find({}, callback);
	},
	update: function(subscriber, update, callback) {
		return db.subscribers.update({_id: subscriber._id}, { $set: update }, callback);
	}
};