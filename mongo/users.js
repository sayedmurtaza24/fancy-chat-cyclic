const { getUsers } = require('./db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWTSECRET = process.env.JWT_AUTH_SECRET;

const addUser = ({ email, username, password }, callback) => {
  if (!username || !email || !password || !password.trim().length > 6)
    return callback(403, { message: 'Bad request!' });

  getUsers()
    .then(async users => {
      const existingUsername = await users.findOne({ $or: [{ email }, { username }] });
      if (existingUsername) {
        return callback(403, { message: 'Already exists!' });
      }
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      await users.insertOne({ email, username, password: hash, salt: salt, friends: [], log: [] });
      callback(201, { messsage: 'User created successfully!' });
    })
    .catch(console.log);
};

const loginUser = ({ username, password }, callback) => {
  getUsers()
    .then(async users => {
      const user = await users.findOne({ username });
      if (!user) {
        return callback(404, { message: 'User not found!' });
      }
      const passwordHash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
      if (user.password === passwordHash) {
        const token = jwt.sign({ username }, JWTSECRET);
        callback(200, {
          message: 'Signed in...',
          data: {
            username: user.username,
            friends: (user.friends || []),
          }
        }, token);
      } else {
        callback(403, { message: 'Can\'t sign in...' });
      }
    })
    .catch(console.log);
}

module.exports = { addUser, loginUser };