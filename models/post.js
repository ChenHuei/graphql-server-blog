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


module.exports = {
  getPosts: () => posts,
  getPost: (id) => posts.find(post => post.id === id),
  filterUserPost: (id) => posts.filter(post => post.authorId === id),
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
  
}