import { CognitoUserPool } from "amazon-cognito-identity-js"

// Backend / AWS configuration. These are public client identifiers (Cognito
// pool/client IDs are safe to ship in a SPA); kept here as the single source.
export const API_URL = "https://bi2179b7r7.execute-api.us-east-1.amazonaws.com/prod"
export const S3_BUCKET = "https://documentflow-files-217019990923.s3.amazonaws.com"

export const poolData = {
  UserPoolId: "us-east-1_l9br8j9ax",
  ClientId: "1ok3trp2uigpjrb823lk6mpipk",
}

export const userPool = new CognitoUserPool(poolData)
