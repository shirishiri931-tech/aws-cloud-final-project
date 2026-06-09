# DocumentFlow Cloud
Cloud-Based Project Document Management System
AWS Cloud Systems Management – Final Project
Azrieli College of Engineering | 2025-2026 | Lecturer: Uri Berman

## Project Description

DocumentFlow Cloud is a serverless cloud-based document management system built on AWS.
The system provides a single source of truth for all project documents.
Every document has an owner, reviewer, deadline, status, current version, and full version history.
The system sends automatic notifications when statuses change and alerts the PMO when documents become overdue.

### The Problem
In project-based organizations documents are shared via email causing:
- Version confusion – no one knows which file is the latest
- No ownership tracking – unclear who is responsible
- Missed deadlines – no automated alerts
- No audit trail – no history of who changed what and when

### The Solution
One central cloud system where every document has a clear owner, status, deadline, and version history.

## Team Members

| Name | GitHub User | AWS IAM User |
|------|-------------|--------------|
| Shiri | shirishiri931-tech | shiri-cloud |
| [Team Member 2] | [github-user] | [iam-user] |
| [Team Member 3] | [github-user] | [iam-user] |
| [Team Member 4] | [github-user] | [iam-user] |

## AWS Architecture

Region: us-east-1

### Mandatory Services
| Service | Role |
|---------|------|
| Amazon S3 | File storage + static frontend hosting |
| Amazon DynamoDB | Document metadata + version history |
| AWS Lambda | Business logic (5 functions) |
| Amazon API Gateway | REST API |
| AWS IAM | Roles and permissions |

### Additional Services
| Service | Role |
|---------|------|
| Amazon Cognito | User authentication |
| Amazon SES | Email notifications |
| Amazon EventBridge | Daily overdue-check job |
| Amazon CloudWatch | Logs and monitoring |

## Repository Structure

- frontend/ – React web application
- backend/functions/ – Lambda functions
- backend/template.yaml – AWS SAM template
- docs/architecture/ – Architecture diagram
- docs/screenshots/ – AWS Console screenshots

## Document Status Workflow

Not Started -> In Progress -> Ready for Review -> Under Review -> Approved / Revision Required -> Completed
Any document past its deadline automatically becomes Overdue.

## Environment Variables (never commit these)

AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=DocumentFlow-Documents
DYNAMODB_HISTORY_TABLE=DocumentFlow-VersionHistory
S3_BUCKET_NAME=documentflow-files
COGNITO_USER_POOL_ID=your-pool-id
SES_SENDER_EMAIL=your-verified-email

## GenAI Usage
This project was developed with the assistance of Claude (Anthropic).
All prompts are documented in the project specification document.
