import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DocumentFlow-Documents')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        required_fields = ['title', 'projectName', 'category', 'assignedUserId', 'deadline']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Missing required field: {field}'})
                }
        
        document_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        item = {
            'documentId': document_id,
            'title': body['title'],
            'projectName': body['projectName'],
            'category': body['category'],
            'assignedUserId': body['assignedUserId'],
            'assignedUserEmail': body.get('assignedUserEmail', ''),
            'reviewerUserId': body.get('reviewerUserId', ''),
            'reviewerEmail': body.get('reviewerEmail', ''),
            'deadline': body['deadline'],
            'status': 'Not Started',
            'currentVersion': 0,
            's3Key': '',
            'currentFileName': '',
            'lastUpdated': now,
            'comments': '',
            'createdAt': now
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Document created successfully',
                'documentId': document_id
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
