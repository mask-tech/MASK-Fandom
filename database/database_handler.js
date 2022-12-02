const User = require('./schemas/User');
const Quiz = require('./schemas/Quiz');
const { LiveQuiz, LiveResult } = require('./schemas/LiveQuiz');

// Handle newly registered user or normal login
async function createNewUser (profile) {
	const user = await User.findById(profile.id);
	if (user) return user;
	const newUser = new User({
		_id: profile.id,
		name: profile.displayName,
		picture: profile.photos[0].value,
		permissions: []
	});
	return newUser.save();
}

// Get User
async function getUser (id) {
	return User.findById(id);
}

function getAllUsers (id) {
	return User.find().lean();
}

// Add new record to database
async function updateUserQuizRecord (stats) { // {userId, quizId, time, score}
	const user = await Quiz.UserInfo.findOne({ userId: stats.userId });
	const userName = (await getUser(stats.userId)).name;
	const record = user || new Quiz.UserInfo({ userId: stats.userId, userName, points: 0, quizData: [] });
	if (!record.quizData) record.quizData = [];
	const key = stats.quizId;
	if (!key) return record.save();
	if (record.quizData.find(elm => elm.quizId === key)) return record;
	else {
		record.quizData.push({
			quizId: key,
			points: stats.score,
			time: stats.time
		});
		record.points += stats.score;
	}
	return record.save();
}

// User statistics
async function getUserStats (userId) {
	const user = await Quiz.UserInfo.findOne({ userId });
	if (user) return user;
	else return updateUserQuizRecord({ userId });
}

function getQuizzes () {
	return Quiz.Questions.find().lean();
}

async function getLiveQuiz () {
	const date = new Date().toISOString().slice(0, 10);
	const quiz = await LiveQuiz.UserInfo.findOne({ title: date });
	if (quiz) return quiz.toObject();
}

async function getLiveResult (userId, quizId, currentQ) {
	const res = await LiveResult.findOne({ userId, quizId, question: currentQ });
	if (res) return res.toObject();
}

async function getAllLiveResults (quizId) {
	const res = await LiveResult.find({ quizId }).lean();
	return res;
}

async function addLiveResult (userId, quizId, currentQ, points, answer, timeLeft, result) {
	const user = await getUser(userId);
	const results = new LiveResult({
		userId,
		username: user.name,
		quizId,
		question: currentQ,
		points,
		answer,
		timeLeft,
		result
	});
	await results.save();
	return results.toObject();
}

module.exports = {
	createNewUser,
	getUser,
	getAllUsers,
	updateUserQuizRecord,
	getQuizzes,
	getUserStats,
	getLiveQuiz,
	getLiveResult,
	getAllLiveResults,
	addLiveResult
};
