const { getUsers } = require('./db');

const allowedCallLogTypes = Object.freeze([
  'INCOMING_REJECTED',
  'OUTGOING_REJECTED',
  'INCOMING_ACCEPTED',
  'OUTGOING_ACCEPTED',
]);

const registerCallLog = ({ username, log: { type, duration, caller } }, callback) => {
  if (!type || !allowedCallLogTypes.includes(type)
    || !duration || typeof duration !== 'number'
    || !caller)
    return callback(403, { message: 'Bad request!' });

  getUsers()
    .then(async users => {
      const validCaller = await users.findOne({ username: caller });
      if (!validCaller) {
        return callback(403, { message: 'Bad request!' });
      }
      const now = new Date();
      now.setSeconds(now.getSeconds() - duration);
      const time = now.toLocaleString();
      await users.updateOne({ username }, {
        $push: {
          log: { type, duration, caller, time }
        }
      });
      callback(200, { message: 'Updated...' });
    })
    .catch(console.log);
};

const getCallLogs = (username, callback) => {
  getUsers()
    .then(async users => {
      const user = await users.findOne({ username });
      callback(200, user.log);
    })
    .catch(console.log);
}

module.exports = { getCallLogs, registerCallLog };