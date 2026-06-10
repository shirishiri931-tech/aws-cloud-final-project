import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DocumentFlow-Documents')
ses = boto3.client('ses', region_name='us-east-1')

VALID_STATUSES = [
    'Not Started', 'In Progress', 'Ready for Review',
    'Under Review', 'Revision Required', 'Approved',
    'Completed', 'Overdue'
]

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        document_id = event.get('pathParameters', {}).get('id')
        new_status = body.get('status')
        comment = body.get('comment', '')

        if not document_id or not new_status:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing document ID or status'})
            }

        if new_status not in VALID_STATUSES:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Invalid status: {new_status}'})
            }

        now = datetime.utcnow().isoformat()

        table.update_item(
            Key={'documentId': document_id},
            UpdateExpression='SET #st = :status, lastUpdated = :t, comments = :c',
            ExpressionAttributeValues={
                ':status': new_status,
                ':t': now,
                ':c': comment
            },
            ExpressionAttributeNames={'#st': 'status'}
        )

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Status updated successfully',
                'documentId': document_id,
                'newStatus': new_status
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }