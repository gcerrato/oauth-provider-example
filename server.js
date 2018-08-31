const catchErr = err => {
  console.error(err)
  process.exit(1)
}
process.on('uncaughtException', catchErr)
process.on('unhandledRejection', catchErr)

try {
  if (process.env.NODE_ENV !== 'production') {
    const config = require('dotenv').config({ path: '.env' })
    config.parsed && console.log('[CONFIG]', config.parsed)
  }
} catch (e) { console.warn('.env file is not found', e.message) }

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const OAuthServer = require('express-oauth-server')
const ConnectMongo = require('connect-mongo')(session)
const morgan = require('morgan')
const app = express()
const sessionSecret = 'Abracadabra'
const ttls = 43200

app.use('/', express.static('web'))

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser(sessionSecret))
app.use(session({
  name: 'oauth.sid',
  secret: sessionSecret,
  saveUninitialized: false,
  resave: true,
  cookie: {
    maxAge: ttls * 1000
  },
  store: new ConnectMongo({ url: process.env.MONGODB })
}))

app.oauth = new OAuthServer({ model: require('./models/oauth') })

require('./modules/routes')(app)

app.use((err, req, res, next) => {
  console.error(err.message)

  const status = err.response && err.response.status ? err.response.status : err.status || 500
  const payload = { error: err.message }

  res.status(status).json(payload)
  if (next) { next() }
})

app.listen(8000, console.log.bind(console, 'Server is running on port', 8000))
