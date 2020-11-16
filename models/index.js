const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = [
  {
    id: 1,
    email: 'leo.chen@test.com',
    password: 'leo',
    name: 'leo',
    age: 20,
    friendIds: [2, 3]
  },
  {
    id: 2,
    email: 'woody@test.com',
    password: 'woody',
    name: 'Woody',
    age: 30,
    friendIds: [1]
  },
  {
    id: 3,
    email: 'ding@test.com',
    password: 'ding',
    name: 'Ding',
    age: 40,
    friendIds: [1]
  }
];

const posts = [
  {
    id: 1,
    authorId: 1,
    title: 'Hello World',
    description: 'This is my first post',
    likeUsers: [1, 2],
    createdAt: '2018-10-22T01:40:14.941Z'
  },
  {
    id: 2,
    authorId: 2,
    title: 'Nice Day',
    description: 'Hello My Friend!',
    likeUsers: [1],
    createdAt: '2018-10-24T01:40:14.941Z'
  }
];

// utils
const getUser = (id) => users.find(user => user.id === id)

module.exports = {
  getSelf: (id) => getUser(id),
  getUsers: () => users,
  getUser: (id) => getUser(id),
  getPosts: () => posts,
  getPost: (id) => posts.find(post => post.id === id),
  filterUserPost: (id) => posts.filter(post => post.authorId === id),
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
  addPost: (input, self) => {
    const post = {
      id: posts.length + 1,
      authorId: self.id,
      likeUsers: [],
      createdAt: new Date().toString(),
      ...input
    }
    posts.push(post)
    return post
  },
  likePost: (id, self) => {
    const post = posts.find(post => post.id === id)
    const { likeUsers } = post

    if (likeUsers.includes(self.id)) {
      likeUsers.splice(likeUsers.indexOf(self.id), 1)
    } else {
      likeUsers.push(self.id)
    }
    
    return post
  },
  deletePost: (id, self) => {
    const post = posts.find(post => post.id === id)

    if (post.authorId !== self.id) {
      throw new Error('Only author can delete this post')
    } 
    posts.splice(posts.findIndex(post => post.id === id), 1)
    return post
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