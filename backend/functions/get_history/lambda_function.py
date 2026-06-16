import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DocumentFlow-VersionHistory')

def lambda_handler(event, context):
    try:
        document_id = event.get('pathParameters', {}).get('id')
        if not document_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing document ID'})
            }

        response = table.query(
            KeyConditionExpression=Key('documentId').eq(document_id)
        )

        items = sorted(response.get('Items', []), key=lambda x: int(x.get('versionNumber', 0)), reverse=True)

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(items, default=str)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }