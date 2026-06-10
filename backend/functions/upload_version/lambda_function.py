import json
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
documents_table = dynamodb.Table('DocumentFlow-Documents')
history_table = dynamodb.Table('DocumentFlow-VersionHistory')

BUCKET_NAME = 'documentflow-files-217019990923'

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        document_id = event.get('pathParameters', {}).get('id')
        
        if not document_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing document ID'})
            }
        
        response = documents_table.get_item(Key={'documentId': document_id})
        document = response.get('Item')
        
        if not document:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Document not found'})
            }
        
        new_version = int(document.get('currentVersion', 0)) + 1
        file_name = body.get('fileName', 'document')
        s3_key = f"{document_id}/v{new_version}/{file_name}"
        
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={'Bucket': BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=3600
        )
        
        now = datetime.utcnow().isoformat()
        
        documents_table.update_item(
            Key={'documentId': document_id},
            UpdateExpression='SET currentVersion = :v, s3Key = :s, lastUpdated = :t, #st = :status',
            ExpressionAttributeValues={
                ':v': Decimal(new_version),
                ':s': s3_key,
                ':t': now,
                ':status': 'In Progress'
            },
            ExpressionAttributeNames={'#st': 'status'}
        )
        
        history_table.put_item(Item={
            'documentId': document_id,
            'versionNumber': Decimal(new_version),
            's3Key': s3_key,
            'uploadedBy': body.get('uploadedBy', 'unknown'),
            'uploadedAt': now,
            'fileName': file_name
        })
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Version created successfully',
                'versionNumber': new_version,
                'uploadUrl': presigned_url,
                's3Key': s3_key
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }