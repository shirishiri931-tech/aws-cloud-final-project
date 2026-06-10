import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DocumentFlow-Documents')

FINAL_STATUSES = ['Approved', 'Completed', 'Overdue']

def lambda_handler(event, context):
    try:
        today = datetime.utcnow().strftime('%Y-%m-%d')
        now = datetime.utcnow().isoformat()

        response = table.scan(
            FilterExpression=
                Attr('deadline').lt(today) &
                Attr('status').not_exists().__or__(
                    Attr('status').ne('Approved') &
                    Attr('status').ne('Completed') &
                    Attr('status').ne('Overdue')
                )
        )

        items = response.get('Items', [])
        updated = []

        for item in items:
            if item.get('status') not in FINAL_STATUSES:
                table.update_item(
                    Key={'documentId': item['documentId']},
                    UpdateExpression='SET #st = :status, lastUpdated = :t',
                    ExpressionAttributeValues={
                        ':status': 'Overdue',
                        ':t': now
                    },
                    ExpressionAttributeNames={'#st': 'status'}
                )
                updated.append(item['documentId'])

        print(f"Overdue check complete. Updated {len(updated)} documents: {updated}")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Updated {len(updated)} overdue documents',
                'updatedDocuments': updated
            })
        }

    except Exception as e:
        print(f"Error in overdue_check: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }