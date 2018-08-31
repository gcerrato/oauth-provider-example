const user = require('../models/user')
const path = require('path')

const login = async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const redirect = req.query.redirect || ''

  let u = await user.getByCredentials(username, password)
  if (!u) {
    return res.sendFile(path.join(__dirname, '../web/fail.html'))
  }

  req.session.u = { id: u.id }
  console.info(`Logged in as ${JSON.stringify({ id: u.id, email: u.email })}`)

  if (redirect.length > 0) {
    return res.redirect(redirect)
  } else {
    return res.redirect('home')
  }
}

module.exports = app => app.post('/login', login)
