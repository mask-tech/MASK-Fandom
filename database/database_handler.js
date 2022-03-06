const mongoose = require('mongoose');
const User = require('./schemas/User');
const Quiz = require('./schemas/Quiz');

// Handle newly registered user or normal login
exports.createNewUser = function createNewUser (profile) {
	return new Promise((resolve, reject) => {
		let query = User.User.find().where('userId').equals(profile.id);
		query.exec(function (err, existing_users) {
			if (err) reject(err);
			if (existing_users.length) resolve(existing_users[0]);
			else {
				console.log(profile);
				const new_user = new User.User({ userId: profile.id, name: profile.displayName, picture: profile.photos[0].value });
				new_user.save(err => err ? reject(err) : resolve(new_user));
			}
		});
	});
};

// Logout User
exports.logoutUser = function logoutUser (id) {
	return new Promise((resolve, reject) => {
		const query = User.User.findById(id);
		query.exec(function (err, user) {
			if (err) reject(err);
			else resolve(user);
		});
	});
};

// Add new record to database, uses put
exports.updateUserQuizRecord = function updateUserQuizRecord (stats) { // {userId, quizId, time, score}
	return new Promise((resolve, reject) => {
		const query = Quiz.UserQuizData.find().where('userId').equals(stats.userId);
		query.exec((err, existing_users) => {
			if (err) reject(err);
			const record = existing_users[0] || new Quiz.UserQuizData({ userId: stats.userId, points: 0, quizData: {} });
			const key = stats.quizId;
			if (record[key]) return resolve(record);
			record.points += stats.score;
			record.quizData[key] = { score: stats.score, time: stats.time };
			record.save(err => err ? reject(err) : resolve(record));
		});
	});
};

// User statistics
exports.getUser = function getUser (userId) {
	return new Promise((resolve, reject) => {
		let query = Quiz.UserQuizData.find().where('userId').equals(userId);
		query.exec((err, existing_users) => {
			if (err) reject(err);
			if (!existing_users.length) reject(new Error('No data found'));
			else resolve(existing_users[0]);
		});
	});
};