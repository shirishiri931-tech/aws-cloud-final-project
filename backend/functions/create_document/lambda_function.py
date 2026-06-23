import json
import re
import boto3
import uuid
from datetime import datetime, timezone

DEADLINE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DocumentFlow-Documents')
ses = boto3.client('ses', region_name='us-east-1')

SENDER_EMAIL = 'shirishiri931@gmail.com'

def send_notification(to_email, subject, message):
    if not to_email:
        return
    try:
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [to_email]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': message}}
            }
        )
    except Exception as e:
        print(f"Email error: {str(e)}")

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

        if not DEADLINE_RE.match(str(body['deadline'])):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid deadline format, expected YYYY-MM-DD'})
            }

        for email_field in ('assignedUserEmail', 'reviewerEmail'):
            email_value = body.get(email_field, '')
            if email_value and not EMAIL_RE.match(str(email_value)):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Invalid email format for {email_field}'})
                }

        document_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

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
            'createdAt': now,
            'createdByEmail': body.get('createdByEmail', '')
        }

        table.put_item(Item=item)

        assigned_email = body.get('assignedUserEmail', '')
        if assigned_email:
            subject = f"DocumentFlow - New Task Assigned: {body['title']}"
            message = f"""You have been assigned a new document task.

Document: {body['title']}
Project: {body['projectName']}
Category: {body['category']}
Deadline: {body['deadline']}

Please log in to DocumentFlow Cloud to upload the document."""
            send_notification(assigned_email, subject, message)

        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Document created successfully',
                'documentId': document_id
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }
