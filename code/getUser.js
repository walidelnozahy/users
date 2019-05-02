const aws = require('aws-sdk')
const dynamodb = new aws.DynamoDB.DocumentClient()
const jwt = require('jsonwebtoken')

module.exports = async (event) => {
  const { token, id } = event
  let decoded
  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRET)
  } catch (e) {
    throw Error('Unauthorized')
  }

  if (decoded.role === 'admin') {
    const params = {
      Key: {
        id: id
      },
      TableName: process.env.TABLE_NAME
    }
    try {
      return dynamodb.get(params).promise()
    } catch (e) {
      throw Error('user does not exist')
    }
  }

  throw Error('only admin can acccess users')
}
