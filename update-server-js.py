#!/usr/bin/env python3
import boto3
import base64

# Read the local server.js file
with open('backend/dist/server.js', 'r', encoding='utf-8') as f:
    server_js_content = f.read()

# Encode to base64
encoded_content = base64.b64encode(server_js_content.encode('utf-8')).decode('utf-8')

# Create SSM client
ssm = boto3.client('ssm', region_name='us-east-1')

# Commands to execute
commands = [
    f"echo '{encoded_content}' | base64 -d > /home/ssm-user/agrinext/backend/dist/server.js",
    "cd /home/ssm-user/agrinext/backend",
    "pkill -f 'node dist/server.js' || true",
    "export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH",
    "nohup node dist/server.js > ../backend.log 2>&1 &",
    "sleep 3",
    "ps aux | grep 'node dist/server.js' | grep -v grep"
]

# Send command
response = ssm.send_command(
    InstanceIds=['i-004ef74f37ba59da1'],
    DocumentName='AWS-RunShellScript',
    Parameters={'commands': commands}
)

print(f"Command ID: {response['Command']['CommandId']}")
print("Waiting for command to complete...")
