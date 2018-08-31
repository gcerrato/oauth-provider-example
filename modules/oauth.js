const path = require('path')
const user = require('../models/user')

module.exports = app => {
  // serve auth (allow/deny) form
  app.get(`/o/authorize`, async (req, res) => {
    if (!req.session.u) {
      return res.redirect(`/login?redirect=${req.originalUrl.replace('?', '&')}`)
    }
    return res.sendFile(path.join(__dirname, '../web/authorize.html'))
  })

  // process auth (allow/deny) response
  app.post('/o/authorize', app.oauth.authorize({
    authenticateHandler: {
      handle: async req => {
        const u = req.session.u || {}
        return user.get(u.id)
      }
    }
  }))

  // generate and return access token
  app.post(`/o/token`, app.oauth.token({
    accessTokenLifetime: 3600,
    refreshTokenLifetime: 1209600,
    requireClientAuthentication: { 'authorization_code': false, 'refresh_token': false }
  }))
}
