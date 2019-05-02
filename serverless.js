const { Component } = require('@serverless/components')

const shortid = require('shortid')

class Users extends Component {
  async default() {
    this.cli.status('Deploying')

    const tableName = 'users'
    const tokenSecret = this.state.tokenSecret || shortid()

    const awsDynamoDb = await this.load('@serverless/aws-dynamodb')
    const awsLambda = await this.load('@serverless/aws-lambda')

    await awsDynamoDb({
      name: tableName
    })

    this.state.tokenSecret = tokenSecret
    await this.save()

    await awsLambda({
      name: 'users',
      code: './code',
      handler: 'index.run',
      env: {
        TABLE_NAME: tableName,
        TOKEN_SECRET: tokenSecret
      }
    })
    this.cli.outputs({})
    return {}
  }
  async remove() {
    this.cli.status('Removing')
    const awsDynamoDb = await this.load('@serverless/aws-dynamodb')
    const awsLambda = await this.load('@serverless/aws-lambda')
    await awsDynamoDb.remove()
    await awsLambda.remove()
  }
}
module.exports = Users
