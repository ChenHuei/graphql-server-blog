const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = [
  {
    id: 1,
    email: "leo.chen@test.com",
    password: "leo",
    name: "leo",
    age: 20,
    friendIds: [2, 3],
  },
  {
    id: 2,
    email: "woody@test.com",
    password: "woody",
    name: "Woody",
    age: 30,
    friendIds: [1],
  },
  {
    id: 3,
    email: "ding@test.com",
    password: "ding",
    name: "Ding",
    age: 40,
    friendIds: [1],
  },
];

// utils
const getUser = (id) => users.find(user => user.id === id)

module.exports = {
  getSelf: (id) => getUser(id),
  getUsers: () => users,
  getUser: (id) => getUser(id),
  filterUserFriends: (list) => users.filter(user => list.includes(user.id)),
  filterPostLikeUsers: (list) => list.map(id => getUser(id)),
  updateSelfInfo: (input, self) => {
    const newSelf = {
      ...getUser(self.id),
      ...input
    }
    users.splice(users.findIndex(user => user.id === self.id), 1, newSelf)

    return newSelf
  },
  addFriend: (id, self) => {
    const { friendIds } = getUser(self.id)

    if (!friendIds.includes(id)) {
      friendIds.push(id)
    }

    return me
  },
  signUp: async (input, saltRounds) => {
    if (users.some(user => user.email === input.email)) {
      throw new Error('Someone used this email')
    }
    const { password, ...other } = input
    const user = {
      id: users.length + 1,
      friends: [],
      post: [],
      password: await bcrypt.hash(password, saltRounds),
      ...other
    }
    users.push(user)
    return user
  },
  login: async (email, password, secret) => {
    const user = users.find(user => user.email === email)
    if (!user) {
      throw new Error("email doesn't exist")
    }
    if (!await bcrypt.compare(password, user.password)) {
      throw new Error('wrong password')
    }
    return {
      token: await jwt.sign(user, secret, {
        expiresIn: '1d'
      })
    }
  }
}