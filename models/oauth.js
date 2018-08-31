const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const url = process.env.MONGODB

class OAuth {
  async getClient (clientId) {
    console.log('Looking for client', clientId)
    return MongoClient.connect(url)
      .then(function (db) {
        return db.collection('clients').findOne({id: clientId})
      }).catch(e => {
        console.warn(e)
        return null
      })
  }

  async getAuthorizationCode (code) {
    console.log('Looking for auth code', code)
    return MongoClient.connect(url)
      .then(db => {
        return Promise.all([db, db.collection('codes').findOne({authorizationCode: code})])
      }).then(results => {
        const db = results[0]
        const authCode = results[1]
        const client = this.getClient(authCode.clientId)
        const user = db.collection('users').findOne({id: authCode.userId})
        return Promise.all([authCode, client, user])
      }).then(results => {
        const authCode = results[0]
        const client = results[1]
        const user = results[2]
        const res = {
          code: authCode.authorizationCode,
          expiresAt: new Date(authCode.expiresAt),
          redirectUri: authCode.redirectUri,
          scope: authCode.scope,
          user: {id: user.id},
          client: client
        }
        return res
      }).catch(e => {
        console.warn(e)
        return null
      })
  }

  async saveAuthorizationCode (authorizationCode, client, user) {
    console.log('Saving auth code', authorizationCode)
    return MongoClient.connect(url)
      .then(function (db) {
        const data = Object.assign({}, authorizationCode, {
          clientId: client.id,
          userId: user.id
        })
        return db.collection('codes').insert(data)
      })
      .then(function (result) {
        if (result) {
          return {
            authorizationCode: authorizationCode.authorizationCode,
            expiresAt: authorizationCode.expiresAt,
            redirectUri: authorizationCode.redirectUri,
            scope: authorizationCode.scope,
            client: client,
            user: {id: user.id}
          }
        } else {
          return null
        }
      }).catch(e => {
        console.warn(e)
        return null
      })
  }

  async revokeAuthorizationCode (authorizationCode) {
    console.log('Revoking auth code', authorizationCode.code)
    return MongoClient.connect(url)
      .then(db => {
        return db.collection('codes').deleteOne({authorizationCode: authorizationCode.code})
      }).then(result => {
        if (result.result.ok === 1) {
          return true
        } else {
          return false
        }
      }).catch(e => {
        console.warn(e)
        return false
      })
  }

  async getAccessToken (token) {
    return MongoClient.connect(url)
      .then(db => {
        return db.collection('tokens').findOne({accessToken: token})
      })
      .then(token => {
        const client = this.getClient()
        const res = {
          accessToken: token.accessToken,
          accessTokenExpiresAt: new Date(token.accessTokenExpiresAt),
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: new Date(token.refreshTokenExpiresAt),
          scope: token.scope,
          user: {id: token.userId},
          client: client
        }
        return res
      })
      .catch(e => {
        console.warn(e)
        return null
      })
  }

  async saveToken (token, client, user) {
    return MongoClient.connect(url)
      .then(function (db) {
        const data = Object.assign({}, token, {
          clientId: client.id,
          userId: user.id
        })
        return db.collection('tokens').insert(data)
      })
      .then(function (result) {
        if (result.result.ok === 1) {
          return {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            scope: token.scope,
            client: client,
            user: {id: user.id}
          }
        } else {
          return null
        }
      }).catch(e => {
        console.warn(e)
        return null
      })
  }

  async revokeToken (token) {
    console.log('Revoking token', token)
    return MongoClient.connect(url)
      .then(db => {
        return db.collection('tokens').deleteOne({accessToken: token.accessToken})
      }).then(count => {
        return count === 1
      }).catch(e => {
        console.warn(e)
        return false
      })
  }

  async getAccessTokenFromHeader (header) {
    try {
      const token = (header.match(/\w+\s(.*)/) || [])[1]
      if (!token || token.trim().length === 0) {
        return null
      }

      const accessToken = await this.getAccessToken(token)
      if (accessToken && Object.keys(accessToken).length > 0) {
        return accessToken
      }
    } catch (e) { console.warn(e) }
    return null
  }
}

module.exports = new OAuth()
