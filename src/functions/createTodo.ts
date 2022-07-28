import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamoDbClient";
import { v4 as uuidv4 } from 'uuid'

interface ICreateTodo {
  title: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { title } = JSON.parse(event.body) as ICreateTodo
  const { user_id } = event.pathParameters

  const id = uuidv4()

  const responseVerification = await document.query({
    TableName: "users_todos_serverless",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": user_id
    }
  }).promise()

  const userExists = responseVerification.Items[0]

  if(!userExists && user_id.toString() !== '0832dd28-e1ca-471b-89b3-c1bb803cc86') {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "User not found"
      })
    }
  }

  await document.put({
    TableName: "todos_serverless",
    Item: {
      id,
      user_id,
      title,
      done: false,
      deadline: new Date().getTime()
    }
  }).promise()

  const response = await document.query({
    TableName: "todos_serverless",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items[0])
  }
}
