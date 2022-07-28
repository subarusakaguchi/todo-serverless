import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamoDbClient";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters

  const response = await document.scan({
    FilterExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
      ":user_id": user_id.toString()
    },
    TableName: "todos_serverless"
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items)
  }
}
