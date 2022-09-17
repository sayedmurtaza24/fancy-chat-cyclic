const { getUsers } = require('./db');

const addFriend = ({ username, name }, callback) => {
  getUsers()
    .then(async users => {
      const user = await users.findOne({ username });
      const friend = await users.findOne({ username: name });
      if (!friend || !user || username === name) {
        return callback(404, { message: 'Username doesn\'t exist!' });
      }
      if (!user.friends.includes(name)) {
        user.friends.push(name);
      }
      await users.replaceOne({ username }, user);
      callback(200, { message: 'Friend added!' });
    })
    .catch(console.log);
}

const getAllFriends = (username, callback) => {
  getUsers()
    .then(async users => {
      const user = await users.findOne({ username });
      callback(200, user.friends);
    })
    .catch(console.log);
}

module.exports = { addFriend, getAllFriends };