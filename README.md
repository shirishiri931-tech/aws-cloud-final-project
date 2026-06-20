# DocumentFlow Cloud
Cloud-Based Project Document Management System
AWS Cloud Systems Management - Final Project
Azrieli College of Engineering | 2025-2026 | Lecturer: Uri Berman

## Project Description

DocumentFlow Cloud is a serverless cloud-based document management system built on AWS.
It provides a single source of truth for project documents, tracking ownership, version history, deadlines, and approval status.

### The Problem
In project-based organizations, documents are shared via email causing:
- Version confusion - no one knows which file is the latest
- No ownership tracking - unclear who is responsible
- Missed deadlines - no automated alerts
- No audit trail - no history of who changed what and when

### The Solution
One central cloud system where every document has a clear responsible user, reviewer, status, deadline, and full version history with email notifications at each stage.

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Manages users and role assignments via Admin Panel. Creates users in Cognito with random temporary passwords (no fixed passwords). |
| PMO | Creates documents, assigns a Responsible User and Reviewer, sets deadlines, tracks status across all documents. |
| Reviewer | Reviews documents assigned for review, downloads, uploads revised/annotated versions, approves/rejects/requests revisions. |

There is no fixed "Owner" role. Each document has an assignedUserId/assignedUserEmail field representing whoever is currently responsible for it. The same person can be assignedUser on one document and Reviewer on another.

## Document Lifecycle & Email Notifications

1. PMO creates a document, specifying a Responsible User and Reviewer (selected from existing system users via dropdown)
   -> Email sent to Responsible User: "New Task Assigned"
2. Responsible User uploads a file marked as Submitted
   -> Email sent to Reviewer: "Document Ready for Review"
3. Reviewer reviews, optionally uploads an annotated version, then changes status
   -> If Approved -> Email sent to the PMO who created the document
   -> If Revision Required / Rejected -> Email sent to the Responsible User
4. If revision is needed, Responsible User uploads again and the cycle repeats
5. All versions are preserved in version history; the current version is always clearly indicated

Documents become "Overdue" automatically (deadline passed and status is not Approved) - this is calculated, not selected manually.

## AWS Architecture

Region: us-east-1

### Core Services
| Service | Role |
|---------|------|
| Amazon S3 | Private file storage for document versions (Presigned URLs for upload/download) |
| Amazon DynamoDB | Document metadata (DocumentFlow-Documents) + version history (DocumentFlow-VersionHistory) |
| AWS Lambda | 8 functions for business logic |
| Amazon API Gateway | REST API with CORS-enabled routes |
| AWS IAM | Least-privilege role for Lambda execution |

### Additional Services
| Service | Role |
|---------|------|
| Amazon Cognito | User authentication, group-based roles (Admin/PMO/Reviewer) |
| Amazon SES | Email notifications throughout the document lifecycle |
| Amazon EventBridge | Daily scheduled job to flag overdue documents |
| Amazon CloudWatch | Logs and monitoring for all Lambda functions |

### Lambda Functions
| Function | Route | Purpose |
|----------|-------|---------|
| create_document | POST /documents | Creates a document record, emails the Responsible User |
| get_documents | GET /documents | Lists all documents |
| upload_version | POST /documents/{id}/versions | Generates Presigned PUT URL, saves version history, emails Reviewer on Submitted |
| update_status | PUT /documents/{id}/status | Updates status, emails PMO on Approved or Responsible User on Revision Required/Rejected |
| get_download_url | GET /documents/{id}/download | Generates Presigned GET URL (300s expiry) for current or specific version |
| get_history | GET /documents/{id}/history | Returns full version history for a document |
| manage_users | GET/POST /users | Lists users, creates new Cognito users with random temp passwords |
| overdue_check | EventBridge daily trigger | Flags documents past deadline as Overdue |

## Repository Structure

aws-cloud-final-project/
- README.md
- frontend/ - React (Vite) single-page application (src/App.jsx)
- backend/functions/ - 8 Lambda functions (Python 3.11)
- docs/architecture/ - Architecture diagram
- docs/screenshots/ - AWS Console screenshots

## Document Status Workflow

Not Started -> In Progress -> Ready for Review -> Under Review -> Approved / Revision Required / Rejected

Overdue is computed automatically and is not a selectable status.

## Setup Instructions

### Prerequisites
- AWS CLI configured with appropriate IAM permissions
- Node.js 18+
- Python 3.11+

### Run Frontend Locally
cd frontend
npm install
npm run dev

### Deploy Backend Changes
cd backend/functions/<function_name>
zip function.zip lambda_function.py
aws lambda update-function-code --function-name documentflow-<function-name> --zip-file fileb://function.zip --region us-east-1

## Security Notes
- S3 bucket for documents is private; all access uses time-limited Presigned URLs
- Lambda IAM role uses a dedicated least-privilege inline policy for SES (ses:SendEmail, ses:SendRawEmail) rather than AmazonSESFullAccess
- No hardcoded passwords; Cognito generates random temporary passwords on user creation
- SES is currently in Sandbox mode - notification emails are only delivered to verified addresses

## GenAI Usage
This project was developed with the assistance of Claude (Anthropic).
All prompts are documented in the project specification document.