const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const url = process.env.MONGODB

module.exports = {
  get: async (id) => {
    console.log('looking for user by id: ', id)
    return MongoClient.connect(url)
      .then(db => {
        const user = db.collection('users').findOne({id: id})
        return user
      }).catch(e => {
        console.warn(e)
        return null
      })
  },

  getByCredentials: async (username, password) => {
    console.log('looking for user: ', username)
    return MongoClient.connect(url)
      .then(db => {
        const user = db.collection('users').findOne({'username': username, 'password': password})
        return user
      }).catch(e => {
        console.warn(e)
        return null
      })
  }
}
