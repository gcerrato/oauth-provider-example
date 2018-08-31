const oauth = require('../models/oauth')
const user = require('../models/user')

const profile = async (req, res) => {
  const token = await oauth.getAccessTokenFromHeader(req.get('Authorization'))
  if (!token) {
    return res.status(401).send({ error: 'token not found' })
  }

  if (token.user) {
    let u = await user.get(token.user.id)
    delete u.password
    delete u._id

    console.info('Returning user profile', u)
    return res.send(u)
  }

  res.status(404).send({ error: 'user not found' })
}

module.exports = app => app.get('/accounts/profile', app.oauth.authenticate(), profile)
