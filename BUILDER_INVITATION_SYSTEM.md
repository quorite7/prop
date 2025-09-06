# Secure Builder Invitation System Implementation

## Overview
A comprehensive secure builder invitation system that allows homeowners to invite builders to their projects using one-time invitation codes with expiration, ensuring builders can only access projects they were specifically invited to.

## Features Implemented

### 1. Secure Invitation Code Generation
- **Location**: `BuilderInvitationTab.tsx`
- **Backend**: Lambda endpoints `/projects/{projectId}/invitations`
- **Features**:
  - 8-character unique invitation codes
  - 7-day expiration period
  - Email-based invitations
  - Copy-to-clipboard functionality
  - Email integration for sending codes

### 2. Builder Registration with Invitation Codes
- **Location**: Enhanced `RegisterPage.tsx`
- **Features**:
  - Dynamic form that shows invitation code field when "Builder" is selected
  - Real-time invitation code validation
  - Auto-population from URL parameters (`?code=ABC12345`)
  - Project information display upon valid code entry
  - Seamless registration flow for invited builders

### 3. Builder Access Management
- **Backend Tables**:
  - `builder-invitations`: Stores invitation codes and metadata
  - `project-access`: Manages builder access to specific projects
  - `project-quotes`: Stores submitted quotes
  - `sow-documents`: Enhanced for builder access

### 4. Builder Dashboard with Project Management
- **Location**: `BuilderDashboardPageNew.tsx`
- **Features**:
  - "Add Project Invitation" functionality
  - List of accessible projects
  - Project status tracking
  - Direct navigation to project details and quote submission

### 5. Secure Builder Project View
- **Location**: `BuilderProjectViewPage.tsx`
- **Features**:
  - Access-controlled project viewing
  - SoW display for invited builders
  - Quote submission interface
  - Project details and requirements display

### 6. Quote Submission System
- **Features**:
  - Structured quote submission (total cost, labor, materials, timeline)
  - Quote description and approach details
  - Secure submission with builder validation
  - Quote tracking and status management

### 7. Project Owner Quote Management
- **Location**: Enhanced `BuilderInvitationTab.tsx`
- **Features**:
  - View all project invitations and their status
  - Display received quotes with comparison interface
  - Quote acceptance workflow
  - Builder selection from submitted quotes

## Security Features

### Access Control
- **Project Ownership Validation**: Only project owners can generate invitations
- **Builder Access Validation**: Builders can only access projects they were invited to
- **Invitation Code Expiration**: 7-day automatic expiration
- **One-time Use**: Invitation codes are marked as used after acceptance

### Data Protection
- **Secure Code Generation**: UUID-based 8-character codes
- **Access Logging**: All access attempts are tracked
- **User Validation**: JWT-based authentication for all operations
- **Project Isolation**: Builders cannot discover or access uninvited projects

## API Endpoints

### Invitation Management
```
POST /projects/{projectId}/invitations - Generate invitation code
GET /projects/{projectId}/invitations - Get project invitations (owner only)
POST /invitations/validate - Validate invitation code
POST /invitations/accept - Accept invitation (existing builders)
```

### Builder Access
```
GET /builder/projects - Get builder's accessible projects
GET /builder/projects/{projectId} - Get project details for builder
POST /builder/projects/{projectId}/quotes - Submit quote
```

### Quote Management
```
GET /projects/{projectId}/quotes - Get project quotes (owner only)
```

## Database Schema

### builder-invitations
```
id (PK), projectId (GSI), invitationCode (GSI), builderEmail, status, 
createdAt, expiresAt, acceptedAt, acceptedBy, createdBy
```

### project-access
```
id (PK), projectId (GSI), builderId (GSI), accessType, grantedAt, invitationId
```

### project-quotes
```
id (PK), projectId (GSI), builderId (GSI), totalCost, laborCost, materialsCost,
timeline, description, status, submittedAt
```

## User Flows

### 1. Homeowner Inviting Builder
1. Navigate to project dashboard → Builders tab
2. Click "Invite Builder" → Enter builder email
3. System generates 8-character code
4. Share code via email or copy-paste
5. Track invitation status and received quotes

### 2. New Builder Registration
1. Receive invitation code from homeowner
2. Visit registration page → Select "Builder"
3. Enter invitation code (auto-validates)
4. Complete registration form
5. Email verification → Auto-accept invitation → Access project

### 3. Existing Builder Joining Project
1. Receive invitation code
2. Login to builder dashboard
3. Click "Add Project Invitation"
4. Enter code → Validate → Access granted
5. View project details and submit quote

### 4. Builder Quote Submission
1. Access invited project from dashboard
2. Review project details and SoW
3. Click "Submit Quote"
4. Fill quote details (cost, timeline, description)
5. Submit → Quote appears in homeowner's dashboard

## Deployment

### Database Tables
```bash
./deploy-invitation-tables.sh
```

### Lambda Function Updates
The existing Lambda function has been enhanced with new endpoints for invitation management.

### Frontend Updates
- Enhanced registration page with invitation code support
- New builder dashboard with project management
- Updated project dashboard with invitation functionality
- New builder project view with quote submission

## Security Considerations

1. **Invitation Code Entropy**: 8-character codes provide sufficient entropy for security
2. **Expiration Policy**: 7-day expiration prevents long-term exposure
3. **Access Validation**: Every request validates builder access to projects
4. **Audit Trail**: All invitation and access events are logged
5. **Email Validation**: Invitations are tied to specific email addresses
6. **Project Isolation**: Builders cannot enumerate or access uninvited projects

## Future Enhancements

1. **Email Notifications**: Automated email sending for invitations
2. **Bulk Invitations**: Invite multiple builders simultaneously
3. **Builder Ratings**: Rating system for completed projects
4. **Advanced Filtering**: Filter builders by specialization and location
5. **Quote Comparison Tools**: Enhanced quote analysis and comparison
6. **Mobile Optimization**: Mobile-specific invitation flows
7. **Integration APIs**: Third-party builder platform integrations

## Testing

### Manual Testing Scenarios
1. Generate invitation code as homeowner
2. Register new builder with invitation code
3. Existing builder accepts invitation code
4. Builder submits quote for invited project
5. Homeowner views and compares quotes
6. Access control validation (unauthorized access attempts)
7. Invitation code expiration handling

### Security Testing
1. Attempt to access projects without invitation
2. Try to use expired invitation codes
3. Validate JWT token requirements
4. Test project ownership validation
5. Verify builder isolation between projects

The system is now fully implemented and ready for deployment with comprehensive security measures and user-friendly interfaces for both homeowners and builders.
