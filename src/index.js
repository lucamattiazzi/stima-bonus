const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const got = require('got')
const path = require('path')
const { config } = require('dotenv')

config()

const { PORT, URL, TIMEOUT = 60 * 1000 } = process.env

const body = {
  targetUrl: '',
  customUrlParams: '',
  layoutVersion: 162044109836,
  layoutName: 'bonus mob',
  isClientRedayToRedirect: false,
  isBeforeOrIdle: false,
}

let speed = 1 // users/second

function retrieveData() {
  got
    .post(URL, { json: body })
    .json()
    .then((data) => {
      const { usersInLineAheadOfYou, expectedServiceTimeUTC, lastUpdatedUTC } = data.ticket
      const from = new Date(lastUpdatedUTC)
      const to = new Date(expectedServiceTimeUTC)
      const users = parseInt(usersInLineAheadOfYou)
      const deltaSeconds = (to - from) / 1000
      const currentSpeed = users / deltaSeconds
      console.log('currentSpeed', currentSpeed)
      speed = currentSpeed
    })
    .catch((err) => console.error(err))
}

function getExpectedTime(position) {
  const deltaSeconds = position / speed
  const expected = new Date(Date.now() + deltaSeconds * 1000)
  return expected.getTime()
}

const server = express()
server.use(cookieParser())
server.use(cors())
server.use(bodyParser.json())

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

server.post('/expected', (req, res) => {
  const positionInQueue = req.body.position
  const expectedTime = getExpectedTime(parseInt(positionInQueue))
  res.json({ expectedTime })
})

setInterval(retrieveData, TIMEOUT)
retrieveData()

server.listen(PORT, () => {
  console.log(`Wella! bonusmobilita.itaila.it is listening to localhost:${PORT}`)
})
