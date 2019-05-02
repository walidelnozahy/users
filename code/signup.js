const aws = require('aws-sdk')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const shortid = require('shortid')
const dynamodb = new aws.DynamoDB.DocumentClient()

module.exports = async (event) => {
  const { username, password, profile } = event

  const params = {
    TableName: process.env.TABLE_NAME
  }

  if (!username) {
    throw Error('please provide username')
  }
  // make sure password exist and is string more than 7
  if (!password || (typeof password === 'string' && password.length < 7)) {
    throw Error('please provide a valid password')
  }

  if (profile && typeof profile !== 'object') {
    throw Error('profile not valid')
  }

  const users = await dynamodb.scan(params).promise()
  const user = users.Items.find((item) => item.username === username)
  if (user) {
    throw Error('username taken')
  }

  const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')

  const newUser = {
    Item: {
      date: Date.now(),
      id: shortid(),
      username: username,
      password: hashedPassword,
      profile: profile || {}
    },
    TableName: process.env.TABLE_NAME
  }

  await dynamodb.put(newUser).promise()

  const user = {
    username,
    profile,
    id: newUser.Item.id,
    date: newUser.Item.date
  }
  const token = jwt.sign(user, process.env.TOKEN_SECRET)
  return { token, user }
}
