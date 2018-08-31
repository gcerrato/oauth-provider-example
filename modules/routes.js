const path = require('path')

module.exports = (app) => {
  app.get('/sampleredirect', (req, res) => {
    return res.sendFile(path.join(__dirname, '../web/redirect.html'))
  })

  app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '../web/login.html'))
  })

  // handle login requests route and implementation
  require('./login')(app)

  // user profile route and implementation
  require('./profile')(app)

  // OAuth2 3-legged (http://oauthbible.com/#oauth-2-three-legged) routes
  require('./oauth')(app)
}
