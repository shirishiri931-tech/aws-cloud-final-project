import json
import boto3
import logging
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
documents_table = dynamodb.Table('DocumentFlow-Documents')
history_table = dynamodb.Table('DocumentFlow-VersionHistory')
s3 = boto3.client('s3', region_name='us-east-1')

BUCKET_NAME = 'documentflow-files-217019990923'
CORS = {'Access-Control-Allow-Origin': '*'}

def lambda_handler(event, context):
    try:
        document_id = event.get('pathParameters', {}).get('id')
        params = event.get('queryStringParameters') or {}
        version = params.get('version')

        if not document_id:
            return response(400, {'error': 'Missing document ID'})

        if version:
            # Validation
            try:
                version_number = int(version)
                if version_number <= 0:
                    raise ValueError
            except (TypeError, ValueError):
                return response(400, {'error': 'Invalid version number. Must be a positive integer.'})

            result = history_table.get_item(
                Key={'documentId': document_id, 'versionNumber': Decimal(version_number)}
            )
            item = result.get('Item')
            if not item:
                return response(404, {'error': f'Version {version_number} not found'})
            s3_key = item.get('s3Key', '')
            if not s3_key:
                return response(404, {'error': 'File not found for this version'})
            file_name = item.get('fileName', 'document')
        else:
            result = documents_table.get_item(Key={'documentId': document_id})
            item = result.get('Item')
            if not item:
                return response(404, {'error': 'Document not found'})
            s3_key = item.get('currentS3Key') or item.get('s3Key', '')
            current_version = int(item.get('currentVersion', 0))
            if not s3_key or current_version == 0:
                return response(404, {'error': 'No file uploaded yet'})
            file_name = item.get('currentFileName', 'document')
            version_number = current_version

        # Safe filename for Content-Disposition
        safe_filename = file_name.replace('"', '').replace('\\', '')

        download_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': s3_key,
                'ResponseContentDisposition': f'attachment; filename="{safe_filename}"'
            },
            ExpiresIn=300
        )

        return response(200, {
            'downloadUrl': download_url,
            'fileName': file_name,
            'versionNumber': version_number
        })

    except Exception as e:
        logger.error(f'Error in get_download_url: {str(e)}', exc_info=True)
        return response(500, {'error': 'Internal server error'})

def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': CORS,
        'body': json.dumps(body, default=str)
    }
