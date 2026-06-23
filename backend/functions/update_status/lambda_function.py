import json
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DocumentFlow-Documents')
ses = boto3.client('ses', region_name='us-east-1')

SENDER_EMAIL = 'shirishiri931@gmail.com'

VALID_STATUSES = [
    'Not Started', 'In Progress', 'Ready for Review',
    'Under Review', 'Revision Required', 'Approved',
    'Rejected'
]

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

        doc_response = table.get_item(Key={'documentId': document_id})
        document = doc_response.get('Item', {})

        now = datetime.now(timezone.utc).isoformat()

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

        title = document.get('title', '')
        project_name = document.get('projectName', '')
        assigned_email = document.get('assignedUserEmail', '')
        created_by_email = document.get('createdByEmail', '')

        if new_status == 'Approved' and created_by_email:
            subject = f'DocumentFlow - Document Approved: {title}'
            message = f"""The document has been approved by the reviewer.

Document: {title}
Project: {project_name}
Comment: {comment}
Updated At: {now}

Please log in to DocumentFlow Cloud to view the document."""
            send_notification(created_by_email, subject, message)

        elif new_status in ('Revision Required', 'Rejected') and assigned_email:
            subject = f'DocumentFlow - Action Required: {title}'
            message = f"""The document requires your attention.

Document: {title}
Project: {project_name}
New Status: {new_status}
Comment: {comment}
Updated At: {now}

Please log in to DocumentFlow Cloud to view the document."""
            send_notification(assigned_email, subject, message)

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
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }
