import json
import boto3
import secrets
import string

cognito = boto3.client('cognito-idp', region_name='us-east-1')
USER_POOL_ID = 'us-east-1_l9br8j9ax'

VALID_ROLES = ['Admin', 'PMO', 'Reviewer']

def generate_temp_password():
    chars = string.ascii_letters + string.digits
    while True:
        pwd = ''.join(secrets.choice(chars) for _ in range(10)) + secrets.choice("!@#$%")
        if any(c.isupper() for c in pwd) and any(c.islower() for c in pwd) and any(c.isdigit() for c in pwd):
            return pwd

def lambda_handler(event, context):
    try:
        method = event.get('httpMethod')
        path = event.get('path', '')

        if method == 'GET' and '/users' in path:
            return list_users()
        elif method == 'POST' and '/users' in path:
            body = json.loads(event.get('body', '{}'))
            return create_user(body)
        elif method == 'DELETE' and '/users/' in path:
            username = event.get('pathParameters', {}).get('username')
            return delete_user(username)
        else:
            return response(400, {'error': 'Invalid request'})

    except Exception as e:
        return response(500, {'error': str(e)})

def list_users():
    result = cognito.list_users(UserPoolId=USER_POOL_ID)
    users = []
    for u in result['Users']:
        attrs = {a['Name']: a['Value'] for a in u['Attributes']}
        groups = cognito.admin_list_groups_for_user(
            Username=u['Username'],
            UserPoolId=USER_POOL_ID
        )
        group_names = [g['GroupName'] for g in groups['Groups']]
        users.append({
            'username': u['Username'],
            'email': attrs.get('email', ''),
            'firstName': attrs.get('given_name', ''),
            'lastName': attrs.get('family_name', ''),
            'status': u['UserStatus'],
            'groups': group_names,
            'createdAt': str(u['UserCreateDate'])
        })
    return response(200, users)

def create_user(body):
    email = body.get('email')
    group = body.get('group')
    first_name = body.get('firstName', '')
    last_name = body.get('lastName', '')

    if not email:
        return response(400, {'error': 'Email is required'})
    if group not in VALID_ROLES:
        return response(400, {'error': 'Invalid role. Must be Admin, PMO, or Reviewer'})

    temp_password = generate_temp_password()

    cognito.admin_create_user(
        UserPoolId=USER_POOL_ID,
        Username=email,
        UserAttributes=[
            {'Name': 'email', 'Value': email},
            {'Name': 'email_verified', 'Value': 'true'},
            {'Name': 'given_name', 'Value': first_name},
            {'Name': 'family_name', 'Value': last_name}
        ],
        TemporaryPassword=temp_password
    )

    cognito.admin_add_user_to_group(
        UserPoolId=USER_POOL_ID,
        Username=email,
        GroupName=group
    )

    return response(201, {'message': 'User created. Invitation email sent.', 'email': email, 'group': group})

def delete_user(username):
    if not username:
        return response(400, {'error': 'Username is required'})
    cognito.admin_delete_user(UserPoolId=USER_POOL_ID, Username=username)
    return response(200, {'message': 'User deleted successfully'})

def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str)
    }
