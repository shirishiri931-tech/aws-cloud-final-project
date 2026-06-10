import json
import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DocumentFlow-Documents')

def lambda_handler(event, context):
    try:
        params = event.get('queryStringParameters') or {}
        
        filter_expr = None
        
        if 'status' in params:
            filter_expr = Attr('status').eq(params['status'])
        
        if 'projectName' in params:
            expr = Attr('projectName').eq(params['projectName'])
            filter_expr = filter_expr & expr if filter_expr else expr
        
        if 'ownerId' in params:
            expr = Attr('ownerId').eq(params['ownerId'])
            filter_expr = filter_expr & expr if filter_expr else expr
        
        if filter_expr:
            response = table.scan(FilterExpression=filter_expr)
        else:
            response = table.scan()
        
        items = response.get('Items', [])
        
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