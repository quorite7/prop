const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, QueryCommand, GetCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, AdminConfirmSignUpCommand, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { v4: uuidv4 } = require('uuid');
const { CognitoJWTVerifier } = require('./cognito-jwt-verifier');

const dynamoClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
const cognito = new CognitoIdentityProviderClient({});
const s3 = new S3Client({});
const bedrockRuntimeClient = new BedrockRuntimeClient({ region: 'eu-west-1' });

// Initialize JWT verifier
const jwtVerifier = new CognitoJWTVerifier(
    process.env.USER_POOL_ID,
    process.env.AWS_REGION || 'eu-west-2'
);

// Environment variables
const PROJECTS_TABLE = process.env.PROJECTS_TABLE;
const BUILDER_ACCESS_TABLE = process.env.BUILDER_ACCESS_TABLE;
const AUDIT_LOG_TABLE = process.env.AUDIT_LOG_TABLE;
const QUESTIONNAIRE_TABLE = process.env.QUESTIONNAIRE_TABLE || 'questionnaire-sessions';
const SOW_TASKS_TABLE = process.env.SOW_TASKS_TABLE || 'sow-tasks';

// Utility functions
const generateId = () => uuidv4();

// Function to retrieve project documents from S3
async function getProjectDocuments(projectId) {
    try {
        // Get document metadata from DynamoDB
        const result = await dynamodb.send(new QueryCommand({
            TableName: 'uk-home-documents',
            IndexName: 'ProjectIdIndex',
            KeyConditionExpression: 'projectId = :projectId',
            ExpressionAttributeValues: {
                ':projectId': projectId
            }
        }));

        const documents = [];
        for (const doc of result.Items || []) {
            try {
                // Get document content from S3
                const s3Response = await s3.send(new GetObjectCommand({
                    Bucket: 'uk-home-documents-bucket',
                    Key: doc.s3Key
                }));
                
                const content = await s3Response.Body.transformToString();
                documents.push({
                    fileName: doc.fileName,
                    fileType: doc.fileType,
                    content: content.substring(0, 10000) // Limit content to 10KB per document
                });
            } catch (s3Error) {
                console.log(`Could not retrieve document ${doc.fileName}:`, s3Error.message);
                // Continue with other documents
            }
        }
        
        return documents;
    } catch (error) {
        console.log('Error retrieving project documents:', error);
        return [];
    }
}

// Bedrock SoW generation function
async function generateSoWWithBedrock(sowId, project, questionnaireSession) {

                        // Retrieve project documents to include as context
                    const projectDocuments = await getProjectDocuments(project.id);
                    let documentsContext = '';
                    if (projectDocuments.length > 0) {
                        documentsContext += '\nUse the following documents to inform your questions and avoid asking for information already provided.\n';
                        projectDocuments.forEach(doc => {
                            documentsContext += `\n--- ${doc.fileName} (${doc.fileType}) ---\n${doc.content}\n`;
                        });
                    }

    // New JSON-focused prompt for reliable parsing
    const jsonPrompt = `You are an experienced UK home renovations builder. Create a Statement of Work and return ONLY a valid JSON object with this exact structure:

{
  "title": "Statement of Work - ${project.projectType}",
  "sections": [
    {
      "title": "Executive Summary",
      "content": "Project overview, objectives, scope summary, timeline, and total value"
    },
    {
      "title": "Detailed Scope of Work", 
      "content": "Comprehensive breakdown of all work packages including structural, building envelope, internal works, M&E, and finishes"
    },
    {
      "title": "Materials and Specifications",
      "content": "Material grades, standards (BS/EN), quality requirements, sustainability measures"
    },
    {
      "title": "Programme and Milestones",
      "content": "Work sequence, milestone dates, critical path, inspection points"
    },
    {
      "title": "Costs and Payment Schedule",
      "content": "Cost breakdown, payment milestones, variation procedures"
    },
    {
      "title": "Quality Standards and Compliance",
      "content": "Building Regulations compliance, NHBC Standards, quality control, warranties"
    },
    {
      "title": "Health, Safety and Environmental",
      "content": "CDM 2015 compliance, risk assessments, environmental protection, waste management"
    },
    {
      "title": "Contract Conditions",
      "content": "Start/completion dates, insurance, dispute resolution, acceptance criteria"
    }
  ],
  "projectDetails": {
    "type": "${project.projectType}",
    "address": "${project.propertyAddress ? Object.values(project.propertyAddress).join(', ') : 'Not specified'}",
    "requirements": "${project.requirements?.description || 'Not specified'}",
    "estimatedValue": ${project.requirements?.budget?.max},
    "duration": "8-12 weeks"
  }
}

Project Details:
- Type: ${project.projectType}
- Address: ${project.propertyAddress ? Object.values(project.propertyAddress).join(', ') : 'Not specified'}
- Requirements: ${project.requirements?.description || 'Not specified'}
- Budget: ${project.requirements?.budget ? `£${project.requirements.budget.min || 0} - £${project.requirements.budget.max || 'Open'}` : 'Not specified'}

IMPORTANT: Return ONLY the JSON object above with detailed professional content in each section. No additional text before or after the JSON.`;

// Old prompt
    const prompt = `You are an experienced UK home renovations builder with 15+ years of experience, preparing a comprehensive Statement of Work (SoW) for a residential construction project.
You must create a professional, detailed SoW that complies with UK industry standards and best practices.

## Project Information to Include:
**Fixed Information:**
- Project Type: ${project.projectType}
- Property Address: ${project.propertyAddress.line1}, ${project.propertyAddress.city}, ${project.propertyAddress.postcode}
- Description: ${project.requirements.description}
- Project Documentation: ${documentsContext || 'Not provided'}

**Dynamic Information Gathered:**
Questionnaire Responses: ${JSON.stringify(questionnaireSession.responses)}

## Industry Standards Compliance:
Your SoW MUST reference and comply with the following UK industry guidelines where applicable:

### **RICS (Royal Institution of Chartered Surveyors) Standards:**
- RICS New Rules of Measurement (NRM1) for cost estimating and cost planning
- RICS New Rules of Measurement (NRM2) for detailed measurement for building works
- RICS Professional Standards for project management and cost control
- RICS Building Survey and Condition Assessment guidelines

### **RIBA Plan of Work 2020:**
- Stage 0: Strategic Definition
- Stage 1: Preparation and Briefing  
- Stage 2: Concept Design
- Stage 3: Spatial Coordination
- Stage 4: Technical Design
- Stage 5: Manufacturing and Construction
- Stage 6: Handover
- Stage 7: Use
Reference appropriate RIBA stages for this project's scope and current phase.

### **NHBC (National House Building Council) Guidelines:**
- NHBC Standards for construction quality and methodology
- Technical requirements for structural work, insulation, and weatherproofing
- Quality assurance and inspection requirements
- Warranty and defects liability considerations

### **Additional UK Standards:**
- Building Regulations 2010 (and amendments)
- CDM Regulations 2015 (Construction Design and Management)
- British Standards (BS) relevant to construction materials and methods
- Local Authority planning and building control requirements

## Required SoW Structure:

### 1. Executive Summary
- Project overview and key objectives
- Total contract value and timeline
- Critical success factors and risks

### 2. Project Description
- Detailed scope of work with clear boundaries
- Property details and existing conditions
- Client requirements and project vision alignment

### 3. Scope of Work (Detailed)
- **Included Works:** Comprehensive list organized by trade/phase
- **Excluded Works:** Clear statement of what's not included
- **Provisional Items:** Items subject to further investigation
- **Prime Cost Items:** Client-selected items with allowances

### 4. Standards and Compliance
- Reference to applicable RICS, RIBA, NHBC standards
- Building Regulations compliance strategy
- Planning permission conditions adherence
- Quality standards and British Standards to be applied

### 5. Programme and Methodology
- Work phases aligned with RIBA stages where applicable
- Critical path activities and dependencies
- Methodology referencing NHBC best practices
- Client decision points and approval stages

### 6. Materials and Specifications
- Material specifications referencing British Standards
- Quality grades and performance requirements
- Supplier/manufacturer requirements
- Environmental and sustainability considerations

### 7. Health, Safety and Compliance
- CDM 2015 compliance and responsibilities
- Risk assessments and method statements
- Insurance and liability requirements
- Site safety measures and client obligations

### 8. Quality Assurance
- Inspection schedules aligned with NHBC standards
- Hold points and witness points
- Testing and commissioning requirements
- Defects liability and warranty periods

### 9. Commercial Terms
- Payment schedule tied to completion milestones
- Variations procedure (RICS compliant)
- Cost control and reporting methods
- Final account procedures

### 10. Handover and Post-Completion
- Commissioning and testing procedures
- Documentation and warranties to be provided
- RIBA Stage 6 handover requirements
- Maintenance requirements and guidance

## Professional Requirements:
- Use appropriate technical terminology and industry standards references
- Include relevant clause numbers from Building Regulations where applicable
- Reference specific NHBC Technical Standards sections
- Align work stages with RIBA Plan of Work 2020
- Use NRM2 work breakdown structure for detailed items
- Include risk assessments and mitigation strategies
- Professional presentation with clear section numbering

## Output Format:
Create a comprehensive, professional SoW document that demonstrates industry expertise and compliance with UK construction standards. The document should be suitable for client signature and legally binding contract formation.

**Begin creating the Statement of Work using the project information provided above and ensuring full compliance with the referenced industry standards.**
`;

    const bedrockParams = {
        modelId: 'eu.anthropic.claude-sonnet-4-20250514-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 40000,
            messages: [{ role: 'user', content: jsonPrompt }]
        })
    };

    // Update progress
    await dynamodb.send(new UpdateCommand({
        TableName: SOW_TASKS_TABLE,
        Key: { id: sowId },
        UpdateExpression: 'SET progress = :progress, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
            ':progress': 50,
            ':updatedAt': new Date().toISOString()
        }
    }));

    // Call Bedrock
    const response = await bedrockRuntimeClient.send(new InvokeModelCommand(bedrockParams));
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const generatedContent = responseBody.content[0].text;

    // Parse and structure the SoW
    let sowData;
    try {
        sowData = JSON.parse(generatedContent);
    } catch (e) {
        console.error("Failed to parse Bedrock response as JSON:", e.message);
        console.error("Response content:", generatedContent.substring(0, 500));
        
        // Update task with error status
        await dynamodb.send(new UpdateCommand({
            TableName: SOW_TASKS_TABLE,
            Key: { id: sowId },
            UpdateExpression: "SET #status = :status, progress = :progress, updatedAt = :updatedAt, errorMessage = :error",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
                ":status": "failed",
                ":progress": 0,
                ":updatedAt": new Date().toISOString(),
                ":error": `JSON parsing failed: ${e.message}`
            }
        }));
        
        throw new Error(`Failed to parse SoW response: ${e.message}`);
    }

    const sow = {
        id: sowId,
        projectId: project.id,
        ownerId: project.ownerId,
        ...sowData,
        generatedAt: new Date().toISOString(),
        version: '1.0'
    };

    // Store SoW
    await dynamodb.send(new PutCommand({
        TableName: 'sow-documents',
        Item: sow
    }));

    // Update task status
    await dynamodb.send(new UpdateCommand({
        TableName: SOW_TASKS_TABLE,
        Key: { id: sowId },
        UpdateExpression: 'SET #status = :status, progress = :progress, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
            ':status': 'completed',
            ':progress': 100,
            ':updatedAt': new Date().toISOString()
        }
    }));

    // Update project status
    await dynamodb.send(new UpdateCommand({
        TableName: PROJECTS_TABLE,
        Key: { id: project.id },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
            ':status': 'sow_ready',
            ':updatedAt': new Date().toISOString()
        }
    }));
}

// JWT validation and user extraction utilities
// Get user attributes from Cognito
async function getUserTypeFromCognito(userId) {
    try {
        const { AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
        const result = await cognito.send(new AdminGetUserCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: userId
        }));
        
        const userTypeAttr = result.UserAttributes?.find(attr => attr.Name === 'custom:user_type');
        return userTypeAttr?.Value || 'homeowner';
    } catch (error) {
        console.error('Error getting user type from Cognito:', error);
        return 'homeowner'; // Default fallback
    }
}

async function extractUserFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
    }
    
    const token = authHeader.substring(7);
    try {
        // Use proper Cognito JWT verification
        const payload = await jwtVerifier.verifyToken(token);
        console.log('Verified JWT payload:', JSON.stringify(payload, null, 2));
        
        return payload;
    } catch (error) {
        console.error('JWT verification error:', error);
        throw new Error('Invalid or expired token: ' + error.message);
    }
}

async function requireAuth(event) {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
        throw new Error('Authorization header required');
    }
    return await extractUserFromToken(authHeader);
}

// Audit logging
async function logAccess(userId, action, resource, success, details = {}) {
    try {
        await dynamodb.send(new PutCommand({
            TableName: AUDIT_LOG_TABLE,
            Item: {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                userId,
                action,
                resource,
                success,
                details,
                ip: details.ip || 'unknown'
            }
        }));
    } catch (error) {
        console.error('Audit log error:', error);
    }
}

// Builder access control
async function hasBuilderAccess(builderId, projectId) {
    try {
        const result = await dynamodb.send(new GetCommand({
            TableName: 'builder-invitations',
            Key: { projectId, builderId }
        }));
        return !!result.Item && result.Item.status === 'active';
    } catch (error) {
        console.error('Builder access check error:', error);
        return false;
    }
}

async function getBuilderProjects(builderId) {
    try {
        const result = await dynamodb.send(new QueryCommand({
            TableName: 'builder-invitations',
            IndexName: 'BuilderIdIndex',
            KeyConditionExpression: 'builderId = :builderId',
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':builderId': builderId, ':status': 'active' }
        }));
        return result.Items || [];
    } catch (error) {
        console.error('Get builder projects error:', error);
        return [];
    }
}

async function isProjectOwner(userId, projectId) {
    try {
        const result = await dynamodb.send(new GetCommand({
            TableName: PROJECTS_TABLE,
            Key: { id: projectId }
        }));
        return result.Item && result.Item.userId === userId;
    } catch (error) {
        console.error('Project ownership check error:', error);
        return false;
    }
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    };

    // Debug: Log all incoming requests
    console.log('=== INCOMING REQUEST ===');
    console.log('Method:', event.httpMethod);
    console.log('Path:', event.path);
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Body:', event.body);
    console.log('Query:', JSON.stringify(event.queryStringParameters));
    console.log('PathParameters:', JSON.stringify(event.pathParameters));
    console.log('========================');

    if (event.httpMethod === 'OPTIONS') {
        console.log('OPTIONS request - returning CORS headers');
        return { statusCode: 200, headers };
    }

    try {
        const path = event.path;
        const method = event.httpMethod;
        const body = event.body;

        console.log(`Processing: ${method} ${path}`);

        // Public endpoints - no auth required
        if (path === '/health' || path === '/prod/health') {
            console.log('Health check endpoint');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    status: 'healthy', 
                    timestamp: new Date().toISOString(),
                    path: path,
                    method: method,
                    cognito: {
                        userPoolId: process.env.USER_POOL_ID,
                        clientId: process.env.USER_POOL_CLIENT_ID,
                        region: process.env.AWS_REGION
                    }
                })
            };
        }

        // Auth endpoints - no auth required
        if ((path === '/auth/register' || path === '/prod/auth/register') && method === 'POST') {
            console.log('=== REGISTER ENDPOINT ===');
            
            if (!event.body) {
                console.log('ERROR: No request body');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            let requestData;
            try {
                requestData = JSON.parse(event.body);
                console.log('Parsed request data:', JSON.stringify(requestData, null, 2));
            } catch (parseError) {
                console.log('ERROR: Failed to parse JSON:', parseError.message);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid JSON in request body' })
                };
            }

            const { email, password, userType } = requestData;
            console.log('Registration attempt for email:', email);
            console.log('User type:', userType);
            console.log('Password length:', password ? password.length : 'undefined');

            if (!email || !password) {
                console.log('ERROR: Missing email or password');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email and password are required' })
                };
            }

            try {
                console.log('Creating Cognito user with SignUp...');
                const signUpCommand = new SignUpCommand({
                    ClientId: process.env.USER_POOL_CLIENT_ID,
                    Username: email,
                    Password: password,
                    UserAttributes: [
                        { Name: 'email', Value: email },
                        { Name: 'custom:user_type', Value: userType || 'homeowner' }
                    ]
                });

                const signUpResult = await cognito.send(signUpCommand);
                console.log('User created successfully, verification email sent');
                console.log('SignUp result:', JSON.stringify(signUpResult, null, 2));

                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({ 
                        success: true,
                        data: {
                            user: {
                                email: email,
                                userType: userType,
                                profile: {
                                    firstName: '',
                                    lastName: '',
                                    phone: '',
                                    companyName: ''
                                },
                                emailVerified: false
                            }
                        }
                    })
                };
            } catch (cognitoError) {
                console.log('ERROR: Cognito error:', cognitoError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Registration failed',
                        details: cognitoError.message,
                        code: cognitoError.name
                    })
                };
            }
        }

        if ((path === '/auth/login' || path === '/prod/auth/login') && method === 'POST') {
            console.log('=== LOGIN ENDPOINT ===');
            
            if (!event.body) {
                console.log('ERROR: No request body');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            let requestData;
            try {
                requestData = JSON.parse(event.body);
                console.log('Parsed login data:', JSON.stringify({ email: requestData.email, passwordLength: requestData.password ? requestData.password.length : 0 }));
            } catch (parseError) {
                console.log('ERROR: Failed to parse JSON:', parseError.message);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid JSON in request body' })
                };
            }

            const { email, password } = requestData;
            console.log('Login attempt for email:', email);

            if (!email || !password) {
                console.log('ERROR: Missing email or password');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email and password are required' })
                };
            }

            try {
                console.log('Attempting Cognito authentication...');
                const authCommand = new AdminInitiateAuthCommand({
                    AuthFlow: 'ADMIN_NO_SRP_AUTH',
                    UserPoolId: process.env.USER_POOL_ID,
                    ClientId: process.env.USER_POOL_CLIENT_ID,
                    AuthParameters: {
                        USERNAME: email,
                        PASSWORD: password
                    }
                });

                const result = await cognito.send(authCommand);
                console.log('Authentication successful');
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: {
                            user: {
                                email: email,
                                userType: (await extractUserFromToken(`Bearer ${result.AuthenticationResult.IdToken}`)).userType,
                                profile: {
                                    firstName: '',
                                    lastName: '',
                                    phone: '',
                                    companyName: ''
                                },
                                emailVerified: true
                            },
                            tokens: {
                                accessToken: result.AuthenticationResult.AccessToken,
                                idToken: result.AuthenticationResult.IdToken,
                                refreshToken: result.AuthenticationResult.RefreshToken
                            }
                        }
                    })
                };
            } catch (authError) {
                console.log('ERROR: Authentication error:', authError);
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Authentication failed',
                        details: authError.message,
                        code: authError.name
                    })
                };
            }
        }

        // Email confirmation endpoint
        if ((path === '/auth/confirm' || path === '/prod/auth/confirm') && method === 'POST') {
            console.log('=== CONFIRM EMAIL ENDPOINT ===');
            
            if (!event.body) {
                console.log('ERROR: No request body');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            let requestData;
            try {
                requestData = JSON.parse(event.body);
                console.log('Parsed confirmation data:', JSON.stringify(requestData, null, 2));
            } catch (parseError) {
                console.log('ERROR: Failed to parse JSON:', parseError.message);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid JSON in request body' })
                };
            }

            const { email, confirmationCode } = requestData;
            console.log('Email confirmation attempt for:', email);

            if (!email || !confirmationCode) {
                console.log('ERROR: Missing email or confirmation code');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email and confirmation code are required' })
                };
            }

            try {
                console.log('Confirming user email...');
                const confirmCommand = new ConfirmSignUpCommand({
                    ClientId: process.env.USER_POOL_CLIENT_ID,
                    Username: email,
                    ConfirmationCode: confirmationCode
                });

                await cognito.send(confirmCommand);
                console.log('Email confirmed successfully');

                // If invitation code is provided, assign project to builder
                if (requestData.invitationCode) {
                    console.log('Processing invitation code:', requestData.invitationCode);
                    
                    try {
                        // Find the invitation
                        const invitationResult = await dynamodb.send(new QueryCommand({
                            TableName: 'builder-invitations',
                            IndexName: 'InvitationCodeIndex',
                            KeyConditionExpression: 'invitationCode = :code',
                            ExpressionAttributeValues: { ':code': requestData.invitationCode }
                        }));

                        const invitation = invitationResult.Items?.[0];
                        if (invitation && invitation.status === 'pending' && new Date(invitation.expiresAt) > new Date()) {
                            console.log('Valid invitation found, assigning project access');
                            
                            // Create builder access record
                            const accessRecord = {
                                id: generateId(),
                                projectId: invitation.projectId,
                                builderEmail: email,
                                invitationId: invitation.id,
                                createdAt: new Date().toISOString(),
                                status: 'active'
                            };

                            await dynamodb.send(new PutCommand({
                                TableName: 'uk-home-builder-access',
                                Item: accessRecord
                            }));

                            // Update invitation status
                            await dynamodb.send(new UpdateCommand({
                                TableName: 'builder-invitations',
                                Key: { id: invitation.id },
                                UpdateExpression: 'SET #status = :status, acceptedAt = :acceptedAt, acceptedBy = :acceptedBy',
                                ExpressionAttributeNames: { '#status': 'status' },
                                ExpressionAttributeValues: {
                                    ':status': 'accepted',
                                    ':acceptedAt': new Date().toISOString(),
                                    ':acceptedBy': email
                                }
                            }));

                            // Log the assignment
                            await dynamodb.send(new PutCommand({
                                TableName: 'uk-home-audit-log',
                                Item: {
                                    id: generateId(),
                                    projectId: invitation.projectId,
                                    action: 'BUILDER_INVITATION_ACCEPTED',
                                    details: {
                                        builderEmail: email,
                                        invitationCode: requestData.invitationCode,
                                        acceptedVia: 'email_confirmation'
                                    },
                                    timestamp: new Date().toISOString()
                                }
                            }));

                            console.log('Project access assigned successfully');
                        } else {
                            console.log('Invalid or expired invitation code');
                        }
                    } catch (inviteError) {
                        console.error('Failed to process invitation:', inviteError);
                        // Don't fail the confirmation if invitation processing fails
                    }
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true,
                        message: 'Email confirmed successfully'
                    })
                };
            } catch (confirmError) {
                console.log('ERROR: Email confirmation failed:', confirmError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Email confirmation failed',
                        details: confirmError.message,
                        code: confirmError.name
                    })
                };
            }
        }

        // Resend confirmation code endpoint
        if ((path === '/auth/resend-confirmation' || path === '/prod/auth/resend-confirmation') && method === 'POST') {
            console.log('=== RESEND CONFIRMATION ENDPOINT ===');
            
            if (!event.body) {
                console.log('ERROR: No request body');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            let requestData;
            try {
                requestData = JSON.parse(event.body);
                console.log('Parsed resend data:', JSON.stringify(requestData, null, 2));
            } catch (parseError) {
                console.log('ERROR: Failed to parse JSON:', parseError.message);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid JSON in request body' })
                };
            }

            const { email } = requestData;
            console.log('Resend confirmation for:', email);

            if (!email) {
                console.log('ERROR: Missing email');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email is required' })
                };
            }

            try {
                console.log('Resending confirmation code...');
                const resendCommand = new ResendConfirmationCodeCommand({
                    ClientId: process.env.USER_POOL_CLIENT_ID,
                    Username: email
                });

                await cognito.send(resendCommand);
                console.log('Confirmation code resent successfully');

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true,
                        message: 'Confirmation code sent successfully'
                    })
                };
            } catch (resendError) {
                console.log('ERROR: Resend confirmation failed:', resendError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Failed to resend confirmation code',
                        details: resendError.message,
                        code: resendError.name
                    })
                };
            }
        }

        // Forgot password endpoint
        if ((path === '/auth/forgot-password' || path === '/prod/auth/forgot-password') && method === 'POST') {
            console.log('=== FORGOT PASSWORD ENDPOINT ===');
            
            if (!event.body) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            const { email } = JSON.parse(event.body);
            console.log('Password reset request for email:', email);

            if (!email) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email is required' })
                };
            }

            try {
                console.log('Initiating password reset...');
                const forgotPasswordCommand = new ForgotPasswordCommand({
                    ClientId: process.env.USER_POOL_CLIENT_ID,
                    Username: email
                });

                await cognito.send(forgotPasswordCommand);
                console.log('Password reset code sent successfully');

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true,
                        message: 'Password reset code sent to your email'
                    })
                };
            } catch (forgotError) {
                console.log('ERROR: Forgot password failed:', forgotError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Failed to send password reset code',
                        details: forgotError.message,
                        code: forgotError.name
                    })
                };
            }
        }

        // Reset password endpoint
        if ((path === '/auth/reset-password' || path === '/prod/auth/reset-password') && method === 'POST') {
            console.log('=== RESET PASSWORD ENDPOINT ===');
            
            if (!event.body) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            const { email, code, confirmationCode, newPassword } = JSON.parse(event.body);
            console.log('Password reset confirmation for email:', email);

            // Accept both 'code' and 'confirmationCode' for compatibility
            const resetCode = code || confirmationCode;

            if (!email || !resetCode || !newPassword) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Email, confirmation code, and new password are required' })
                };
            }

            try {
                console.log('Confirming password reset...');
                const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand({
                    ClientId: process.env.USER_POOL_CLIENT_ID,
                    Username: email,
                    ConfirmationCode: resetCode,
                    Password: newPassword
                });

                await cognito.send(confirmForgotPasswordCommand);
                console.log('Password reset completed successfully');

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true,
                        message: 'Password reset successfully'
                    })
                };
            } catch (resetError) {
                console.log('ERROR: Password reset failed:', resetError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Failed to reset password',
                        details: resetError.message,
                        code: resetError.name
                    })
                };
            }
        }

        // AI Guidance endpoint (public - no auth required)
        if ((path === '/ai/guidance' || path === '/prod/ai/guidance') && method === 'POST') {
            console.log('AI Guidance request...');
            
            if (!event.body) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            try {
                const { step, context } = JSON.parse(event.body);
                console.log('AI Guidance for step:', step);

                // Simple mock guidance based on step
                let guidance = '';
                switch (step) {
                    case 'Property Address':
                        guidance = 'Please enter your complete property address including postcode for accurate project planning.';
                        break;
                    case 'Project Type':
                        guidance = 'Select the type of project that best matches your requirements. This helps us provide accurate estimates.';
                        break;
                    default:
                        guidance = 'Please provide the required information to continue with your project.';
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(guidance)
                };
            } catch (error) {
                console.log('ERROR: AI Guidance failed:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        error: 'AI Guidance failed',
                        details: error.message
                    })
                };
            }
        }

        // Project Types endpoint (public - no auth required)
        if ((path === '/projects/types' || path === '/prod/projects/types') && method === 'GET') {
            console.log('Getting project types...');
            
            const projectTypes = [
                // Structural Extensions & Conversions
                {
                    id: 'loft-conversion',
                    name: 'Loft Conversion',
                    description: 'Transform your loft into a beautiful living space with dormer, hip-to-gable, mansard, or velux options',
                    estimatedDuration: '6-12 weeks',
                    estimatedCost: '£15,000 - £60,000',
                    complexity: 'high',
                    requiresPlanning: true
                },
                {
                    id: 'rear-extension',
                    name: 'Rear Extension',
                    description: 'Single-storey, double-storey, wrap-around, or glass box extensions to expand your living space',
                    estimatedDuration: '8-16 weeks',
                    estimatedCost: '£20,000 - £80,000',
                    complexity: 'high',
                    requiresPlanning: true
                },
                {
                    id: 'side-extension',
                    name: 'Side Extension',
                    description: 'Single or double-storey side extensions and infill projects',
                    estimatedDuration: '8-14 weeks',
                    estimatedCost: '£25,000 - £70,000',
                    complexity: 'high',
                    requiresPlanning: true
                },
                {
                    id: 'basement-conversion',
                    name: 'Basement Conversion',
                    description: 'Full basement or partial dig-out conversions for additional living space',
                    estimatedDuration: '12-20 weeks',
                    estimatedCost: '£30,000 - £100,000',
                    complexity: 'high',
                    requiresPlanning: true
                },
                {
                    id: 'garage-conversion',
                    name: 'Garage Conversion',
                    description: 'Convert your garage to living space, home office, gym, or studio',
                    estimatedDuration: '4-8 weeks',
                    estimatedCost: '£8,000 - £25,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'conservatory',
                    name: 'Conservatory & Orangery',
                    description: 'Traditional, modern, lean-to conservatories and orangeries',
                    estimatedDuration: '2-6 weeks',
                    estimatedCost: '£10,000 - £40,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },

                // Room-Specific Renovations
                {
                    id: 'kitchen-renovation',
                    name: 'Kitchen Renovation',
                    description: 'Complete kitchen refit with modern appliances, worktops, and storage solutions',
                    estimatedDuration: '3-8 weeks',
                    estimatedCost: '£8,000 - £50,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'bathroom-renovation',
                    name: 'Bathroom Renovation',
                    description: 'Full bathroom refit, en-suite, wet room, or family bathroom renovation',
                    estimatedDuration: '2-6 weeks',
                    estimatedCost: '£5,000 - £25,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'bedroom-renovation',
                    name: 'Bedroom Renovation',
                    description: 'Master bedroom, children\'s rooms, guest rooms, or nursery renovations',
                    estimatedDuration: '2-4 weeks',
                    estimatedCost: '£3,000 - £15,000',
                    complexity: 'low',
                    requiresPlanning: false
                },
                {
                    id: 'living-room-renovation',
                    name: 'Living Room Renovation',
                    description: 'Open plan living, fireplace installation, built-in storage, or snug creation',
                    estimatedDuration: '2-6 weeks',
                    estimatedCost: '£4,000 - £20,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'home-office',
                    name: 'Home Office Conversion',
                    description: 'Study, library, or workspace conversion with proper lighting and storage',
                    estimatedDuration: '2-4 weeks',
                    estimatedCost: '£3,000 - £12,000',
                    complexity: 'low',
                    requiresPlanning: false
                },

                // External & Structural Work
                {
                    id: 'roofing',
                    name: 'Roofing Work',
                    description: 'Re-roofing, repairs, flat roof replacement, green roofs, slate, tile, or metal roofing',
                    estimatedDuration: '1-4 weeks',
                    estimatedCost: '£5,000 - £25,000',
                    complexity: 'high',
                    requiresPlanning: false
                },
                {
                    id: 'windows-doors',
                    name: 'Windows & Doors',
                    description: 'UPVC, timber, aluminium, bi-fold doors, sliding doors, French doors, sash windows',
                    estimatedDuration: '1-3 weeks',
                    estimatedCost: '£3,000 - £15,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'driveway-patio',
                    name: 'Driveway & Patio',
                    description: 'Block paving, tarmac, gravel, resin, concrete, natural stone patios and driveways',
                    estimatedDuration: '1-2 weeks',
                    estimatedCost: '£2,000 - £12,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },

                // Systems & Infrastructure
                {
                    id: 'central-heating',
                    name: 'Central Heating System',
                    description: 'Boiler replacement, radiator upgrades, underfloor heating, heat pumps',
                    estimatedDuration: '1-3 weeks',
                    estimatedCost: '£3,000 - £15,000',
                    complexity: 'high',
                    requiresPlanning: false
                },
                {
                    id: 'electrical-rewiring',
                    name: 'Electrical Rewiring',
                    description: 'Full rewiring, consumer unit upgrades, EV charging points, smart home systems',
                    estimatedDuration: '1-2 weeks',
                    estimatedCost: '£2,500 - £8,000',
                    complexity: 'high',
                    requiresPlanning: false
                },
                {
                    id: 'plumbing-upgrades',
                    name: 'Plumbing Upgrades',
                    description: 'New bathrooms, kitchen plumbing, water pressure improvements, mains upgrades',
                    estimatedDuration: '1-3 weeks',
                    estimatedCost: '£2,000 - £10,000',
                    complexity: 'high',
                    requiresPlanning: false
                },
                {
                    id: 'insulation',
                    name: 'Insulation Installation',
                    description: 'Loft, cavity wall, external wall, floor, and acoustic insulation',
                    estimatedDuration: '1-2 weeks',
                    estimatedCost: '£1,500 - £8,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'solar-panels',
                    name: 'Solar Panels & Renewables',
                    description: 'Solar panels, battery storage, wind turbines, renewable energy systems',
                    estimatedDuration: '1-2 weeks',
                    estimatedCost: '£4,000 - £20,000',
                    complexity: 'high',
                    requiresPlanning: false
                },

                // Flooring & Interior Finishes
                {
                    id: 'hardwood-flooring',
                    name: 'Hardwood Flooring',
                    description: 'Solid, engineered, parquet, herringbone hardwood flooring installation',
                    estimatedDuration: '1-2 weeks',
                    estimatedCost: '£2,000 - £8,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'tiling',
                    name: 'Tiling Work',
                    description: 'Ceramic, porcelain, natural stone, mosaic tiling for floors and walls',
                    estimatedDuration: '1-2 weeks',
                    estimatedCost: '£1,500 - £6,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'painting-decorating',
                    name: 'Painting & Decorating',
                    description: 'Interior and exterior painting, wallpapering, decorative finishes',
                    estimatedDuration: '1-3 weeks',
                    estimatedCost: '£1,000 - £5,000',
                    complexity: 'low',
                    requiresPlanning: false
                },

                // Specialist Projects
                {
                    id: 'swimming-pool',
                    name: 'Swimming Pool Installation',
                    description: 'Indoor, outdoor, natural pools, hot tubs, and spa installations',
                    estimatedDuration: '8-16 weeks',
                    estimatedCost: '£25,000 - £100,000',
                    complexity: 'high',
                    requiresPlanning: true
                },
                {
                    id: 'home-cinema',
                    name: 'Home Cinema & Media Room',
                    description: 'Soundproofing, projection systems, seating, and acoustic treatments',
                    estimatedDuration: '2-6 weeks',
                    estimatedCost: '£8,000 - £40,000',
                    complexity: 'high',
                    requiresPlanning: false
                },
                {
                    id: 'wine-cellar',
                    name: 'Wine Cellar',
                    description: 'Temperature-controlled wine storage with racking and climate systems',
                    estimatedDuration: '3-8 weeks',
                    estimatedCost: '£10,000 - £50,000',
                    complexity: 'high',
                    requiresPlanning: false
                },
                {
                    id: 'accessibility-modifications',
                    name: 'Accessibility Modifications',
                    description: 'Ramps, stairlifts, wet rooms, door widening for accessibility needs',
                    estimatedDuration: '2-6 weeks',
                    estimatedCost: '£3,000 - £20,000',
                    complexity: 'medium',
                    requiresPlanning: false
                }
            ];

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(projectTypes)
            };
        }
        // Validate invitation code - POST /invitations/validate (public endpoint)
        if (path.match(/^\/(?:prod\/)?invitations\/validate$/) && method === 'POST') {
            try {
                const { invitationCode } = JSON.parse(body);

                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'builder-invitations',
                    IndexName: 'InvitationCodeIndex',
                    KeyConditionExpression: 'invitationCode = :code',
                    ExpressionAttributeValues: { ':code': invitationCode }
                }));

                const invitation = result.Items?.[0];
                if (!invitation || invitation.status !== 'pending' || new Date(invitation.expiresAt) < new Date()) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Invalid or expired invitation' }) };
                }

                const projectResult = await dynamodb.send(new GetCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: invitation.projectId }
                }));

                return { 
                    statusCode: 200, 
                    headers, 
                    body: JSON.stringify({ 
                        valid: true, 
                        projectId: invitation.projectId,
                        projectTitle: projectResult.Item?.requirements?.description || 'Home Improvement Project'
                    }) 
                };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }
        // Protected endpoints (require authentication)
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader) {
            console.log('ERROR: No authorization header for protected endpoint');
            console.log('Available headers:', Object.keys(event.headers));
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    error: 'Authorization header required', 
                    path: path, 
                    method: method,
                    availableHeaders: Object.keys(event.headers)
                })
            };
        }



        // Extract and validate JWT token
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            console.log('ERROR: Invalid authorization header format');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    error: 'Invalid authorization header format. Expected: Bearer <token>' 
                })
            };
        }

        console.log('Token received:', token.substring(0, 20) + '...');

        // Projects endpoint - GET (requires authentication)
        if ((path === '/projects' || path === '/prod/projects') && method === 'GET') {
            console.log('Getting projects...');
            
            try {
                const user = await requireAuth(event);
                console.log('Authenticated user:', user.userId, user.userType);
                
                await logAccess(user.userId, 'GET_PROJECTS', 'projects', true, { 
                    userType: user.userType,
                    ip: event.requestContext?.identity?.sourceIp 
                });
                
                if (user.userType === 'homeowner') {
                    // Homeowners see only their projects
                    try {
                        const command = new QueryCommand({
                            TableName: PROJECTS_TABLE,
                            IndexName: 'UserIdIndex',
                            KeyConditionExpression: 'userId = :userId',
                            ExpressionAttributeValues: { ':userId': user.userId }
                        });
                        
                        const result = await dynamodb.send(command);
                        console.log('Projects retrieved for homeowner:', result.Items.length);
                        
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({ success: true, data: result.Items })
                        };
                    } catch (gsiError) {
                        // Fallback to scan
                        const scanCommand = new ScanCommand({
                            TableName: PROJECTS_TABLE,
                            FilterExpression: 'userId = :userId',
                            ExpressionAttributeValues: { ':userId': user.userId }
                        });
                        
                        const scanResult = await dynamodb.send(scanCommand);
                        console.log('Projects retrieved for homeowner via scan:', scanResult.Items.length);
                        
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({ success: true, data: scanResult.Items })
                        };
                    }
                } else if (user.userType === 'builder') {
                    // Builders see only projects they've been invited to
                    const accessList = await getBuilderProjects(user.userId);
                    const projectIds = accessList.map(access => access.projectId);
                    
                    if (projectIds.length === 0) {
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({ success: true, data: [] })
                        };
                    }
                    
                    // Get project details for accessible projects
                    const projects = [];
                    for (const projectId of projectIds) {
                        try {
                            const result = await dynamodb.send(new GetCommand({
                                TableName: PROJECTS_TABLE,
                                Key: { id: projectId }
                            }));
                            if (result.Item) {
                                projects.push(result.Item);
                            }
                        } catch (error) {
                            console.error(`Error fetching project ${projectId}:`, error);
                        }
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ success: true, data: projects })
                    };
                } else {
                    await logAccess(user.userId, 'GET_PROJECTS', 'projects', false, { 
                        error: 'Invalid user type',
                        userType: user.userType 
                    });
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }
            } catch (authError) {
                console.error('Authentication error:', authError);
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Authentication required: ' + authError.message })
                };
            }
        }

        // Projects endpoint - POST (requires authentication)
        if ((path === '/projects' || path === '/prod/projects') && method === 'POST') {
            console.log('Creating project...');
            
            try {
                const user = await requireAuth(event);
                console.log('Authenticated user creating project:', user.userId, user.userType);
                
                // Only homeowners can create projects
                if (user.userType !== 'homeowner') {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Only homeowners can create projects' })
                    };
                }
                
                const data = JSON.parse(event.body);
                const item = {
                    id: Date.now().toString(),
                    userId: user.userId, // Associate project with user
                    userEmail: user.email,
                    ...data,
                    createdAt: new Date().toISOString()
                };

                const command = new PutCommand({
                    TableName: process.env.PROJECTS_TABLE,
                    Item: item
                });

                await dynamodb.send(command);
                console.log('Project created for user:', user.userId, 'Project ID:', item.id);

                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify(item)
                };
            } catch (error) {
                console.error('Authentication error:', error.message);
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Unauthorized: ' + error.message })
                };
            }
        }

        // Address validation endpoint
        if ((path === '/projects/validate-address' || path === '/prod/projects/validate-address') && method === 'POST') {
            console.log('Validating address...');
            
            if (!event.body) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Request body is required' })
                };
            }

            try {
                const { address } = JSON.parse(event.body);
                console.log('Address to validate:', address);

                // Simple validation logic - in a real app you'd integrate with a proper address validation service
                const isValidPostcode = address.postcode && /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(address.postcode);
                const hasRequiredFields = address.line1 && address.city && address.postcode;

                const result = {
                    isValid: isValidPostcode && hasRequiredFields,
                    suggestions: [],
                    councilData: {
                        localAuthority: 'Sample Council',
                        conservationArea: false,
                        listedBuilding: false
                    }
                };

                // Add some mock suggestions if validation fails
                if (!result.isValid && address.postcode) {
                    result.suggestions = [
                        {
                            line1: address.line1 || '123 Sample Street',
                            city: address.city || 'London',
                            postcode: 'SW1A 1AA',
                            country: 'UK'
                        }
                    ];
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(result)
                };
            } catch (error) {
                console.log('ERROR: Address validation failed:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Address validation failed' })
                };
            }
        }

        // Builder invitation endpoints
        if ((path === '/projects/invite-builder' || path === '/prod/projects/invite-builder') && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const { projectId, builderEmail } = JSON.parse(event.body);
                
                // Only homeowners can invite builders
                if (user.userType !== 'homeowner') {
                    await logAccess(user.userId, 'INVITE_BUILDER', projectId, false, { error: 'Not homeowner' });
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Only homeowners can invite builders' })
                    };
                }
                
                // Verify project ownership
                if (!(await isProjectOwner(user.userId, projectId))) {
                    await logAccess(user.userId, 'INVITE_BUILDER', projectId, false, { error: 'Not project owner' });
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'You can only invite builders to your own projects' })
                    };
                }
                
                // Create builder access record
                await dynamodb.send(new PutCommand({
                    TableName: 'builder-invitations',
                    Item: {
                        projectId,
                        builderId: builderEmail, // Using email as builderId for now
                        status: 'active',
                        invitedBy: user.userId,
                        invitedAt: new Date().toISOString(),
                        permissions: ['view', 'quote']
                    }
                }));
                
                await logAccess(user.userId, 'INVITE_BUILDER', projectId, true, { builderEmail });
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, message: 'Builder invited successfully' })
                };
            } catch (error) {
                console.error('Invite builder error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to invite builder' })
                };
            }
        }

        // Remove builder access
        if ((path === '/projects/remove-builder' || path === '/prod/projects/remove-builder') && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const { projectId, builderId } = JSON.parse(event.body);
                
                if (user.userType !== 'homeowner' || !(await isProjectOwner(user.userId, projectId))) {
                    await logAccess(user.userId, 'REMOVE_BUILDER', projectId, false, { error: 'Access denied' });
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }
                
                await dynamodb.send(new DeleteCommand({
                    TableName: 'builder-invitations',
                    Key: { projectId, builderId }
                }));
                
                await logAccess(user.userId, 'REMOVE_BUILDER', projectId, true, { builderId });
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, message: 'Builder access removed' })
                };
            } catch (error) {
                console.error('Remove builder error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to remove builder access' })
                };
            }
        }

        // Get project access list (for homeowners)
        if ((path === '/projects/access' || path === '/prod/projects/access') && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const projectId = event.queryStringParameters?.projectId;
                
                if (!projectId) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Project ID required' })
                    };
                }
                
                if (user.userType !== 'homeowner' || !(await isProjectOwner(user.userId, projectId))) {
                    await logAccess(user.userId, 'GET_PROJECT_ACCESS', projectId, false, { error: 'Access denied' });
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }
                
                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'builder-invitations',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId }
                }));
                
                await logAccess(user.userId, 'GET_PROJECT_ACCESS', projectId, true);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, data: result.Items })
                };
            } catch (error) {
                console.error('Get project access error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to get project access' })
                };
            }
        }

        // Get project invitations - GET /projects/{projectId}/invitations
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/);
                const projectId = pathMatch[1];
                
                if (user.userType !== 'homeowner' || !(await isProjectOwner(user.userId, projectId))) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }
                
                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'builder-invitations',
                    IndexName: 'ProjectIdIndex',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId }
                }));
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(result.Items || [])
                };
            } catch (error) {
                console.error('Get project invitations error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to get project invitations' })
                };
            }
        }        // Get individual project (with access control)
        if (path.match(/^\/(?:prod\/)?projects\/[^\/]+$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const projectId = path.split('/').pop();
                
                let hasAccess = false;
                
                if (user.userType === 'homeowner') {
                    hasAccess = await isProjectOwner(user.userId, projectId);
                } else if (user.userType === 'builder') {
                    hasAccess = await hasBuilderAccess(user.userId, projectId);
                }
                
                if (!hasAccess) {
                    await logAccess(user.userId, 'GET_PROJECT', projectId, false, { error: 'Access denied' });
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }
                
                const result = await dynamodb.send(new GetCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId }
                }));
                
                if (!result.Item) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'Project not found' })
                    };
                }
                
                await logAccess(user.userId, 'GET_PROJECT', projectId, true);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, data: result.Item })
                };
            } catch (error) {
                console.error('Get project error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to get project' })
                };
            }
        }

        // Document upload URL endpoint - POST (requires authentication)
        if (path === '/documents/upload-url' && method === 'POST') {
            console.log('Getting document upload URL...');
            
            const authHeader = event.headers.Authorization || event.headers.authorization;
            const user = await extractUserFromToken(authHeader);
            if (!user) {
                return requireAuth();
            }

            const { projectId, fileName, fileSize, mimeType, documentType } = JSON.parse(event.body);
            
            if (!projectId || !fileName || !fileSize || !mimeType || !documentType) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: { message: 'Missing required fields' } })
                };
            }

            // Verify user owns the project
            const projectResult = await dynamodb.send(new GetCommand({
                TableName: 'uk-home-projects',
                Key: { id: projectId }
            }));

            if (!projectResult.Item || projectResult.Item.userId !== user.sub) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: { message: 'Access denied' } })
                };
            }

            const documentId = generateId();
            const s3Key = `projects/${projectId}/documents/${documentId}/${fileName}`;
            
            // Create document record
            await dynamodb.send(new PutCommand({
                TableName: 'uk-home-documents',
                Item: {
                    id: documentId,
                    projectId: projectId,
                    userId: user.sub,
                    fileName: fileName,
                    originalName: fileName,
                    fileSize: fileSize,
                    mimeType: mimeType,
                    documentType: documentType,
                    s3Key: s3Key,
                    uploadedAt: new Date().toISOString(),
                    isVisibleToBuilders: false,
                    status: 'pending'
                }
            }));

            // Generate S3 upload URL
            const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({
                Bucket: 'uk-home-documents-bucket',
                Key: s3Key,
                ContentType: mimeType
            }), { expiresIn: 300 }); // 5 minutes

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    uploadUrl: uploadUrl,
                    documentId: documentId,
                    s3Key: s3Key
                })
            };
        }

        // Confirm document upload - POST (requires authentication)
        if (path.match(/^\/documents\/([^\/]+)\/confirm$/) && method === 'POST') {
            const documentId = path.split('/')[2];
            console.log('Confirming document upload:', documentId);
            
            const authHeader = event.headers.Authorization || event.headers.authorization;
            const user = await extractUserFromToken(authHeader);
            if (!user) {
                return requireAuth();
            }

            // Update document status to confirmed
            const result = await dynamodb.send(new UpdateCommand({
                TableName: 'uk-home-documents',
                Key: { id: documentId },
                UpdateExpression: 'SET #status = :status',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':status': 'confirmed',
                    ':userId': user.sub
                },
                ConditionExpression: 'userId = :userId',
                ReturnValues: 'ALL_NEW'
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Attributes)
            };
        }

        // Get project documents - GET (requires authentication)
        if (path.match(/^\/projects\/([^\/]+)\/documents$/) && method === 'GET') {
            const projectId = path.split('/')[2];
            console.log('Getting project documents:', projectId);
            
            const authHeader = event.headers.Authorization || event.headers.authorization;
            const user = await extractUserFromToken(authHeader);
            if (!user) {
                return requireAuth();
            }

            // Verify user owns the project
            const projectResult = await dynamodb.send(new GetCommand({
                TableName: 'uk-home-projects',
                Key: { id: projectId }
            }));

            if (!projectResult.Item || projectResult.Item.userId !== user.sub) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: { message: 'Access denied' } })
                };
            }

            // Get documents for this project
            const result = await dynamodb.send(new QueryCommand({
                TableName: 'uk-home-documents',
                IndexName: 'ProjectIdIndex',
                KeyConditionExpression: 'projectId = :projectId',
                ExpressionAttributeValues: {
                    ':projectId': projectId
                }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Items || [])
            };
        }

        // Initialize project documents - POST (requires authentication) - for new projects
        if (path.match(/^\/projects\/([^\/]+)\/documents$/) && method === 'POST') {
            const projectId = path.split('/')[2];
            console.log('Initializing project documents:', projectId);
            
            const authHeader = event.headers.Authorization || event.headers.authorization;
            const user = await extractUserFromToken(authHeader);
            if (!user) {
                return requireAuth();
            }

            // Verify user owns the project
            const projectResult = await dynamodb.send(new GetCommand({
                TableName: 'uk-home-projects',
                Key: { id: projectId }
            }));

            if (!projectResult.Item || projectResult.Item.userId !== user.sub) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: { message: 'Access denied' } })
                };
            }

            // Return empty array for new projects
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify([])
            };
        }

        // Delete document - DELETE (requires authentication)
        if (path.match(/^\/documents\/([^\/]+)$/) && method === 'DELETE') {
            const documentId = path.split('/')[2];
            console.log('Deleting document:', documentId);
            
            const authHeader = event.headers.Authorization || event.headers.authorization;
            const user = await extractUserFromToken(authHeader);
            if (!user) {
                return requireAuth();
            }

            // Get document to verify ownership and get S3 key
            const docResult = await dynamodb.send(new GetCommand({
                TableName: 'uk-home-documents',
                Key: { id: documentId }
            }));

            if (!docResult.Item || docResult.Item.userId !== user.sub) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: { message: 'Access denied' } })
                };
            }

            // Delete from S3
            await s3.send(new DeleteObjectCommand({
                Bucket: 'uk-home-documents-bucket',
                Key: docResult.Item.s3Key
            }));

            // Delete from DynamoDB
            await dynamodb.send(new DeleteCommand({
                TableName: 'uk-home-documents',
                Key: { id: documentId }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Document deleted successfully' })
            };
        }
        // Questionnaire endpoints
        
        // Start questionnaire - POST /projects/{projectId}/questionnaire/start
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/questionnaire\/start$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const projectId = path.split('/')[2] === 'prod' ? path.split('/')[3] : path.split('/')[2];
                
                // Verify project ownership
                if (!await isProjectOwner(user.userId, projectId)) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }

                const sessionId = generateId();
                const session = {
                    id: sessionId,
                    projectId,
                    userId: user.userId,
                    currentQuestionIndex: 0,
                    responses: [],
                    isComplete: false,
                    completionPercentage: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await dynamodb.send(new PutCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    Item: session
                }));

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(session)
                };
            } catch (error) {
                console.error('Start questionnaire error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: error.message })
                };
            }
        }

        // Get questionnaire session - GET /projects/{projectId}/questionnaire
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/questionnaire$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const projectId = path.split('/')[2] === 'prod' ? path.split('/')[3] : path.split('/')[2];
                
                // Verify project ownership
                if (!await isProjectOwner(user.userId, projectId)) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }

                const result = await dynamodb.send(new QueryCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    IndexName: 'ProjectIdIndex',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId },
                    ScanIndexForward: false,
                    Limit: 1
                }));

                if (!result.Items || result.Items.length === 0) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'No questionnaire session found' })
                    };
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(result.Items[0])
                };
            } catch (error) {
                console.error('Get questionnaire session error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: error.message })
                };
            }
        }

        // Get next question - POST /projects/{projectId}/questionnaire/{sessionId}/next
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/questionnaire\/([^\/]+)\/next$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const pathParts = path.split('/');
                const projectId = pathParts[2] === 'prod' ? pathParts[3] : pathParts[2];
                const sessionId = pathParts[pathParts.length - 2];
                
                // Verify project ownership
                if (!await isProjectOwner(user.userId, projectId)) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }

                // Get project details for context
                const projectResult = await dynamodb.send(new GetCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId }
                }));

                if (!projectResult.Item) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'Project not found' })
                    };
                }

                // Get session
                const sessionResult = await dynamodb.send(new GetCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    Key: { id: sessionId }
                }));

                if (!sessionResult.Item) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'Session not found' })
                    };
                }

                const session = sessionResult.Item;
                const project = projectResult.Item;

                // Try to generate AI question using Bedrock
                let aiResponse;
                console.log(project);
                try {
                    // Retrieve project documents to include as context
                    const projectDocuments = await getProjectDocuments(projectId);
                    let documentsContext = '';
                    if (projectDocuments.length > 0) {
                        documentsContext += '\nUse the following documents to inform your questions and avoid asking for information already provided.\n';
                        projectDocuments.forEach(doc => {
                            documentsContext += `\n--- ${doc.fileName} (${doc.fileType}) ---\n${doc.content}\n`;
                        });
                    }
                    const prompt = `You are assisting an experienced UK home renovations builder to prepare detailed Statements of Work (SoW) and accurate quotes.
                    I have already gathered basic project information from the client (provided below).
                    Your role is to ask intelligent, project-specific dynamic questions to gather all remaining information needed for accurate SoW and quote preparation.
Project Details:
- Type: ${project.projectType}
- Description/Vision: ${project.requirements?.description || 'Not specified'}
- Project Documentation: ${documentsContext || 'Not provided'}
- Budget: ${project.budget || 'Not specified'}
- Timeline: ${project.timeline || 'Not specified'}
- Previous responses: ${JSON.stringify(session.responses || [])}

Your Task:
Based on the fixed information above, ask ONE targeted question at a time to gather project-specific details. Focus only on information that directly impacts the SoW scope, specifications, and accurate costing for THIS specific project type.

Professional Approach:
1. Lead with expertise: Start with the most critical technical question that impacts feasibility or major costs
2. Think like a builder: Consider practical implications, potential problems, and cost drivers
3. Maximum 8 strategic questions: Focus on information that genuinely affects your quote accuracy
4. Use professional judgment: Skip questions where your experience suggests standard assumptions are adequate
5. Signal completion: When you have enough information to prepare a comprehensive quote and SoW

Response Format: You are allowed to respond ONLY in a JSON object using this exact structure. Any other response or preamble will cause error:
{
  "question": {
    "id": "unique_question_id",
    "text": "Your question here",
    "type": "multiple_choice|text",
    "options": ["option1", "option2"] (only for multiple_choice),
    "required": true|false
  },
  "reasoning": "Brief explanation of why this question is important"
}
Question Types:
"text": For open-ended responses requiring detailed answers
"multiple_choice": When specific options help clarify scope or specifications

Draw on your 15+ years of building experience to ask the most important question first.
What do you need to know to quote this job accurately? Format your response as the JSON object specified above.

Question Limits & Stopping Criteria:
1. Maximum 8-10 dynamic questions for most projects
2. Stop immediately when you have sufficient information for:
2.1. Clear scope definition and work breakdown
2.2. Accurate material specifications and quantities
2.3. Labour time estimation
2.4. Access and logistics planning
2.5. Regulatory compliance requirements

Completion Signal:
When you have enough information, you MUST respond with:
"INFORMATION GATHERING COMPLETE" followed by a brief summary of key points that will enable accurate SoW and quote preparation.

Your Approach:
1. Start with the most critical project-specific question that affects scope/pricing
2. Ask maximum 8-10 targeted questions (fewer if possible)
3. Focus ONLY on details that directly impact costing or work methodology
4. Clarify vague responses with follow-ups (these count toward your question limit)
5. Signal completion as soon as you can prepare a comprehensive SoW/quote

Priority Order for Questions:
1. Critical scope boundaries (what's included/excluded)
2. Structural/technical requirements (affects major costs)
3. Access/logistics constraints (affects time/labour costs)
4. Key specifications (materials, finishes that affect pricing)
5. Regulatory requirements not already covered by documents

Begin by asking your first dynamic question. Remember: Maximum 8-10 questions, then signal completion.
`;
                    console.log('Attempting Bedrock AI generation...');
                    console.log('=== BEDROCK PROMPT ===');
                    console.log('Prompt:', prompt);
                    const command = new InvokeModelCommand({
                        modelId: 'eu.anthropic.claude-sonnet-4-20250514-v1:0',
                        body: JSON.stringify({
                            anthropic_version: 'bedrock-2023-05-31',
                            max_tokens: 1000,
                            messages: [{
                                role: 'user',
                                content: prompt
                            }]
                        }),
                        contentType: 'application/json',
                        accept: 'application/json'
                    });

                    const response = await bedrockRuntimeClient.send(command);
                    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
                    
                    console.log('Full Bedrock Parameters:', JSON.stringify(responseBody, null, 2));
                    console.log('=== END BEDROCK PROMPT ===');

                    aiResponse = JSON.parse(responseBody.content[0].text);
                    aiResponse.isComplete = session.currentQuestionIndex >= 8; // AmitD: Temporary stop LLM to 8 questions
                    aiResponse.isAIGenerated = true;
                    console.log('AI generation successful');
                } catch (aiError) {
                    console.error('AI generation failed:', aiError.message);
                    console.error('Full error:', JSON.stringify(aiError, null, 2));
                    
                    // Use fallback questions
                    const fallbackQuestions = [
                        {
                            id: 'project_priority',
                            text: 'What is your main priority for this project?',
                            type: 'multiple_choice',
                            options: ['Quality', 'Speed', 'Budget', 'Minimal disruption'],
                            required: true
                        },
                        {
                            id: 'specific_requirements',
                            text: 'Are there any specific requirements or constraints we should know about?',
                            type: 'text',
                            required: false
                        },
                        {
                            id: 'material_preferences',
                            text: 'Do you have any material preferences?',
                            type: 'text',
                            required: false
                        },
                        {
                            id: 'completion_urgency',
                            text: 'How urgent is the completion of this project?',
                            type: 'scale',
                            required: true
                        }
                    ];

                    const questionIndex = Math.min(session.currentQuestionIndex, fallbackQuestions.length - 1);
                    aiResponse = {
                        question: fallbackQuestions[questionIndex],
                        isComplete: session.currentQuestionIndex >= fallbackQuestions.length - 1,
                        reasoning: 'Using standard questions (AI temporarily unavailable)',
                        isAIGenerated: false,
                        fallbackReason: aiError.message
                    };
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(aiResponse)
                };
            } catch (error) {
                console.error('Get next question error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: error.message })
                };
            }
        }

        // Submit response - POST /projects/{projectId}/questionnaire/{sessionId}/response
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/questionnaire\/([^\/]+)\/response$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const pathParts = path.split('/');
                const projectId = pathParts[2] === 'prod' ? pathParts[3] : pathParts[2];
                const sessionId = pathParts[pathParts.length - 2];
                
                // Verify project ownership
                if (!await isProjectOwner(user.userId, projectId)) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }

                const requestData = JSON.parse(event.body);
                
                // Get current session to check question index
                const sessionResult = await dynamodb.send(new GetCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    Key: { id: sessionId }
                }));

                if (!sessionResult.Item) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'Session not found' })
                    };
                }

                const currentSession = sessionResult.Item;
                const newQuestionIndex = currentSession.currentQuestionIndex + 1;
                const isComplete = newQuestionIndex >= 8; // AmitD: Temporary stop LLM to 8 questions
                const response = {
                    ...requestData,
                    timestamp: new Date().toISOString()
                };

                // Update session with new response
                const result = await dynamodb.send(new UpdateCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    Key: { id: sessionId },
                    UpdateExpression: 'SET responses = list_append(if_not_exists(responses, :empty_list), :response), currentQuestionIndex = currentQuestionIndex + :inc, completionPercentage = :completion, isComplete = :isComplete, updatedAt = :updatedAt', // AmitD: Temporary stop LLM to 8 questions
                    ExpressionAttributeValues: {
                        ':response': [response],
                        ':inc': 1,
                        ':completion': Math.min(100, newQuestionIndex * 10),
                        ':isComplete': isComplete, // AmitD: Temporary stop LLM to 8 questions
                        ':updatedAt': new Date().toISOString(),
                        ':empty_list': []
                    },
                    ReturnValues: 'ALL_NEW'
                }));

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(result.Attributes)
                };
            } catch (error) {
                console.error('Submit response error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: error.message })
                };
            }
        }

        // Complete questionnaire - POST /projects/{projectId}/questionnaire/{sessionId}/complete
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/questionnaire\/([^\/]+)\/complete$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const pathParts = path.split('/');
                const projectId = pathParts[2] === 'prod' ? pathParts[3] : pathParts[2];
                const sessionId = pathParts[pathParts.length - 2];
                
                // Verify project ownership
                if (!await isProjectOwner(user.userId, projectId)) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied' })
                    };
                }

                // Mark session as complete
                const result = await dynamodb.send(new UpdateCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    Key: { id: sessionId },
                    UpdateExpression: 'SET isComplete = :complete, completionPercentage = :completion, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':complete': true,
                        ':completion': 100,
                        ':updatedAt': new Date().toISOString()
                    },
                    ReturnValues: 'ALL_NEW'
                }));

                // Update project status to indicate details collection is complete
                await dynamodb.send(new UpdateCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId },
                    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
                    ExpressionAttributeNames: { '#status': 'status' },
                    ExpressionAttributeValues: {
                        ':status': 'sow_generation',
                        ':updatedAt': new Date().toISOString()
                    }
                }));

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(result.Attributes)
                };
            } catch (error) {
                console.error('Complete questionnaire error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: error.message })
                };
            }
        }

        // Generate SoW - POST /projects/{projectId}/sow/generate
        console.log('=== CHECKING SOW ENDPOINT ===');
        console.log('Path:', path);
        console.log('Method:', method);
        console.log('SoW Regex Test:', path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/generate$/));
        console.log('Method Match:', method === "POST");
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/generate$/) && method === "POST") {
            console.log('=== SOW ENDPOINT MATCHED ===');
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/generate$/);
                const projectId = pathMatch[1];

                const projectResult = await dynamodb.send(new GetCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId }
                }));
                console.log("=== PROJECT DEBUG ===");
                console.log("Project ID:", projectId);
                console.log("User ID:", user.userId);
                console.log("Project exists:", !!projectResult.Item);
                console.log("Project owner:", projectResult.Item?.userId);
                console.log("Owner match:", projectResult.Item?.userId === user.userId);

                if (!projectResult.Item || projectResult.Item.userId !== user.userId) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: "Project not found" }) };
                }

                console.log("=== STARTING QUESTIONNAIRE CHECK ===");
                const questionnaireResult = await dynamodb.send(new QueryCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    IndexName: "ProjectIdIndex",
                    KeyConditionExpression: "projectId = :projectId",
                    ExpressionAttributeValues: { ":projectId": projectId }
                }));

                if (!questionnaireResult.Items || !questionnaireResult.Items[0] || !questionnaireResult.Items[0].isComplete) {
                    console.log("Questionnaire not complete:");
                    return { statusCode: 400, headers, body: JSON.stringify({ error: "Complete questionnaire first" }) };
                }

                console.log("==== Starting to generate SoW ====")

                const sowId = generateId();
                console.log("=== SoW ID Generated ===");
                await dynamodb.send(new PutCommand({
                    TableName: SOW_TASKS_TABLE,
                    Item: {
                        id: sowId,
                        projectId,
                        ownerId: user.userId,
                        status: 'generating',
                        progress: 0,
                        createdAt: new Date().toISOString(),
                        estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
                    }
                }));
                console.log("=== SoW Task Created ===")

                await dynamodb.send(new UpdateCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId },
                    UpdateExpression: "SET #status = :status, sowId = :sowId",
                    ExpressionAttributeNames: { "#status": "status" },
                    ExpressionAttributeValues: { ":status": "sow_generation", ":sowId": sowId }
                }));

                console.log("=== Going to Bedrock now ===");

                setTimeout(() => generateSoWWithBedrock(sowId, projectResult.Item, questionnaireResult.Items[0]), 100);

                return { statusCode: 200, headers, body: JSON.stringify({ sowId, status: "generating" }) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }
        // Get SoW Status - GET /projects/{projectId}/sow/{sowId}/status
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)\/status$/) && method === "GET") {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)\/status$/);
                const projectId = pathMatch[1];
                const sowId = pathMatch[2];

                const taskResult = await dynamodb.send(new GetCommand({
                    TableName: SOW_TASKS_TABLE,
                    Key: { id: sowId }
                }));

                if (!taskResult.Item || taskResult.Item.ownerId !== user.userId) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'SoW task not found' }) };
                }

                return { statusCode: 200, headers, body: JSON.stringify(taskResult.Item) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }
        // Get SoW Document - GET /projects/{projectId}/sow/{sowId}
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)$/) && method === "GET") {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)$/);
                const projectId = pathMatch[1];
                const sowId = pathMatch[2];

                // First check if user owns the project
                const projectResult = await dynamodb.send(new GetCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId }
                }));

                if (!projectResult.Item || projectResult.Item.userId !== user.userId) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Project not found' }) };
                }

                // Then get the SoW document
                const sowResult = await dynamodb.send(new GetCommand({
                    TableName: 'sow-documents',
                    Key: { id: sowId }
                }));

                if (!sowResult.Item || sowResult.Item.projectId !== projectId) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'SoW not found' }) };
                }

                return { statusCode: 200, headers, body: JSON.stringify(sowResult.Item) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Update SoW - PUT /projects/{projectId}/sow/{sowId}
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)$/) && method === "PUT") {
            try {
                const pathParts = path.split('/');
                const projectId = pathParts[pathParts.length - 3];
                const sowId = pathParts[pathParts.length - 1];
                const { items } = JSON.parse(body);

                await dynamodb.send(new UpdateCommand({
                    TableName: 'sow-documents',
                    Key: { id: sowId },
                    UpdateExpression: 'SET items = :items, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':items': items,
                        ':updatedAt': new Date().toISOString()
                    }
                }));

                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Process SoW with AI - POST /projects/{projectId}/sow/{sowId}/process
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)\/process$/) && method === "POST") {
            try {
                const pathParts = path.split('/');
                const projectId = pathParts[pathParts.length - 4];
                const sowId = pathParts[pathParts.length - 2];
                const { items } = JSON.parse(body);

                const prompt = `Review and improve this Scope of Work items for a UK home improvement project. Fix any issues, improve clarity, and ensure completeness:

${JSON.stringify(items, null, 2)}

Return the improved items in the same JSON format with better descriptions, accurate costs, and proper sequencing.`;

                const bedrockParams = {
                    modelId: 'eu.anthropic.claude-sonnet-4-20250514-v1:0',
                    contentType: 'application/json',
                    accept: 'application/json',
                    body: JSON.stringify({
                        anthropic_version: 'bedrock-2023-05-31',
                        max_tokens: 4000,
                        messages: [{ role: 'user', content: prompt }]
                    })
                };

                const response = await bedrockRuntimeClient.send(new InvokeModelCommand(bedrockParams));
                const responseBody = JSON.parse(new TextDecoder().decode(response.body));
                const processedContent = responseBody.content[0].text;

                let processedItems;
                try {
                    processedItems = JSON.parse(processedContent);
                } catch (e) {
                    processedItems = items;
                }

                await dynamodb.send(new UpdateCommand({
                    TableName: 'sow-documents',
                    Key: { id: sowId },
                    UpdateExpression: 'SET items = :items, updatedAt = :updatedAt, processedAt = :processedAt',
                    ExpressionAttributeValues: {
                        ':items': processedItems,
                        ':updatedAt': new Date().toISOString(),
                        ':processedAt': new Date().toISOString()
                    }
                }));

                return { statusCode: 200, headers, body: JSON.stringify({ items: processedItems }) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }
        // Accept SoW - POST /projects/{projectId}/sow/{sowId}/accept
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)\/accept$/) && method === "POST") {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/sow\/([^\/]+)\/accept$/);
                const projectId = pathMatch[1];
                const sowId = pathMatch[2];

                // Verify project ownership
                const projectResult = await dynamodb.send(new GetCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId }
                }));

                if (!projectResult.Item || projectResult.Item.userId !== user.userId) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                // Verify SoW exists and belongs to project
                const sowResult = await dynamodb.send(new GetCommand({
                    TableName: 'sow-documents',
                    Key: { id: sowId }
                }));

                if (!sowResult.Item || sowResult.Item.projectId !== projectId) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'SoW not found' }) };
                }

                // Update project status to sow_ready
                await dynamodb.send(new UpdateCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId },
                    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
                    ExpressionAttributeNames: { '#status': 'status' },
                    ExpressionAttributeValues: {
                        ':status': 'sow_ready',
                        ':updatedAt': new Date().toISOString()
                    }
                }));

                return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }
        // Generate builder invitation code - POST /projects/{projectId}/invitations
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/);
                const projectId = pathMatch[1];
                const { builderEmail } = JSON.parse(body);

                if (!await isProjectOwner(user.userId, projectId)) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const invitationCode = generateId().substring(0, 8).toUpperCase();
                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

                const invitation = {
                    id: generateId(),
                    projectId,
                    invitationCode,
                    builderEmail,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    expiresAt,
                    createdBy: user.userId
                };

                await dynamodb.send(new PutCommand({
                    TableName: 'builder-invitations',
                    Item: invitation
                }));

                return { statusCode: 201, headers, body: JSON.stringify({ invitationCode, expiresAt }) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Get project invitations - GET /projects/{projectId}/invitations
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/);
                const projectId = pathMatch[1];

                if (!await isProjectOwner(user.userId, projectId)) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'builder-invitations',
                    IndexName: 'ProjectIdIndex',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId }
                }));

                return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }


        // Accept invitation (for existing builders) - POST /invitations/accept
        if (path.match(/^\/(?:prod\/)?invitations\/accept$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const { invitationCode } = JSON.parse(body);

                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'builder-invitations',
                    IndexName: 'InvitationCodeIndex',
                    KeyConditionExpression: 'invitationCode = :code',
                    ExpressionAttributeValues: { ':code': invitationCode }
                }));

                const invitation = result.Items?.[0];
                if (!invitation || invitation.status !== 'pending' || new Date(invitation.expiresAt) < new Date()) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Invalid or expired invitation' }) };
                }

                // Grant project access
                await dynamodb.send(new PutCommand({
                    TableName: 'project-access',
                    Item: {
                        id: generateId(),
                        projectId: invitation.projectId,
                        builderId: user.userId,
                        accessType: 'invited',
                        grantedAt: new Date().toISOString(),
                        invitationId: invitation.id
                    }
                }));

                // Update invitation status
                await dynamodb.send(new UpdateCommand({
                    TableName: 'builder-invitations',
                    Key: { id: invitation.id },
                    UpdateExpression: 'SET #status = :status, acceptedAt = :acceptedAt, acceptedBy = :acceptedBy',
                    ExpressionAttributeNames: { '#status': 'status' },
                    ExpressionAttributeValues: {
                        ':status': 'accepted',
                        ':acceptedAt': new Date().toISOString(),
                        ':acceptedBy': user.userId
                    }
                }));

                return { statusCode: 200, headers, body: JSON.stringify({ success: true, projectId: invitation.projectId }) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Get builder project access - GET /builder/projects
        if (path.match(/^\/(?:prod\/)?builder\/projects$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);

                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'project-access',
                    IndexName: 'BuilderIdIndex',
                    KeyConditionExpression: 'builderId = :builderId',
                    ExpressionAttributeValues: { ':builderId': user.userId }
                }));

                const projectIds = result.Items?.map(item => item.projectId) || [];
                const projects = [];

                for (const projectId of projectIds) {
                    const projectResult = await dynamodb.send(new GetCommand({
                        TableName: PROJECTS_TABLE,
                        Key: { id: projectId }
                    }));
                    if (projectResult.Item) {
                        projects.push(projectResult.Item);
                    }
                }

                return { statusCode: 200, headers, body: JSON.stringify(projects) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Get project for builder - GET /builder/projects/{projectId}
        if (path.match(/^\/(?:prod\/)?builder\/projects\/([^\/]+)$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?builder\/projects\/([^\/]+)$/);
                const projectId = pathMatch[1];

                // Check builder access
                const accessResult = await dynamodb.send(new QueryCommand({
                    TableName: 'project-access',
                    IndexName: 'ProjectBuilderIndex',
                    KeyConditionExpression: 'projectId = :projectId AND builderId = :builderId',
                    ExpressionAttributeValues: { 
                        ':projectId': projectId,
                        ':builderId': user.userId 
                    }
                }));

                if (!accessResult.Items?.length) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const projectResult = await dynamodb.send(new GetCommand({
                    TableName: PROJECTS_TABLE,
                    Key: { id: projectId }
                }));

                if (!projectResult.Item) {
                    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Project not found' }) };
                }

                // Get SoW if available
                const sowResult = await dynamodb.send(new QueryCommand({
                    TableName: 'sow-documents',
                    IndexName: 'ProjectIdIndex',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId }
                }));

                return { 
                    statusCode: 200, 
                    headers, 
                    body: JSON.stringify({ 
                        project: projectResult.Item,
                        sow: sowResult.Items?.[0] || null
                    }) 
                };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Submit quote - POST /builder/projects/{projectId}/quotes
        if (path.match(/^\/(?:prod\/)?builder\/projects\/([^\/]+)\/quotes$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?builder\/projects\/([^\/]+)\/quotes$/);
                const projectId = pathMatch[1];
                const quoteData = JSON.parse(body);

                // Check builder access
                const accessResult = await dynamodb.send(new QueryCommand({
                    TableName: 'project-access',
                    IndexName: 'ProjectBuilderIndex',
                    KeyConditionExpression: 'projectId = :projectId AND builderId = :builderId',
                    ExpressionAttributeValues: { 
                        ':projectId': projectId,
                        ':builderId': user.userId 
                    }
                }));

                if (!accessResult.Items?.length) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const quote = {
                    id: generateId(),
                    projectId,
                    builderId: user.userId,
                    ...quoteData,
                    status: 'submitted',
                    submittedAt: new Date().toISOString()
                };

                await dynamodb.send(new PutCommand({
                    TableName: 'project-quotes',
                    Item: quote
                }));

                return { statusCode: 201, headers, body: JSON.stringify(quote) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Get project quotes (for project owner) - GET /projects/{projectId}/quotes
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/quotes$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/quotes$/);
                const projectId = pathMatch[1];

                if (!await isProjectOwner(user.userId, projectId)) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'project-quotes',
                    IndexName: 'ProjectIdIndex',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId }
                }));

                return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Generate builder invitation code - POST /projects/{projectId}/invitations
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/) && method === 'POST') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/);
                const projectId = pathMatch[1];
                const { builderEmail } = JSON.parse(body);

                if (!await isProjectOwner(user.userId, projectId)) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const invitationCode = generateId().substring(0, 8).toUpperCase();
                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

                const invitation = {
                    id: generateId(),
                    projectId,
                    invitationCode,
                    builderEmail,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    expiresAt,
                    createdBy: user.userId
                };

                await dynamodb.send(new PutCommand({
                    TableName: 'builder-invitations',
                    Item: invitation
                }));

                return { statusCode: 201, headers, body: JSON.stringify({ invitationCode, expiresAt }) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Get project invitations - GET /projects/{projectId}/invitations
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/invitations$/);
                const projectId = pathMatch[1];

                if (!await isProjectOwner(user.userId, projectId)) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'builder-invitations',
                    IndexName: 'ProjectIdIndex',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId }
                }));

                return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }

        // Get project quotes (for project owner) - GET /projects/{projectId}/quotes
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/quotes$/) && method === 'GET') {
            try {
                const user = await requireAuth(event);
                const pathMatch = path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/quotes$/);
                const projectId = pathMatch[1];

                if (!await isProjectOwner(user.userId, projectId)) {
                    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access denied' }) };
                }

                const result = await dynamodb.send(new QueryCommand({
                    TableName: 'project-quotes',
                    IndexName: 'ProjectIdIndex',
                    KeyConditionExpression: 'projectId = :projectId',
                    ExpressionAttributeValues: { ':projectId': projectId }
                }));

                return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
            } catch (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
        }
        // Builder profile endpoints
        if (path.match(/^\/(?:prod\/)?builder\/profile$/) && method === 'GET') {
            console.log('=== BUILDER PROFILE ENDPOINT HIT ===');
            try {
                console.log('Attempting to authenticate user...');
                const user = await requireAuth(event);
                console.log('User authenticated:', JSON.stringify(user, null, 2));
                if (user.userType !== 'builder') {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied. Builder account required.' })
                    };
                }

                // Create default profile if it doesn't exist
                const defaultProfile = {
                    id: user.userId,
                    companyName: (user.email && user.email.split('@')[0]) || user.username || 'My Company',
                    contactPerson: {
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || user.username || '',
                        phone: ''
                    },
                    address: {
                        street: '',
                        city: '',
                        postcode: ''
                    },
                    businessDetails: {
                        registrationNumber: '',
                        vatNumber: '',
                        establishedYear: new Date().getFullYear(),
                        employeeCount: 1
                    },
                    certifications: [],
                    insurance: {
                        publicLiability: {
                            provider: '',
                            policyNumber: '',
                            coverage: 1000000,
                            validUntil: ''
                        },
                        employersLiability: {
                            provider: '',
                            policyNumber: '',
                            coverage: 10000000,
                            validUntil: ''
                        }
                    },
                    specializations: [],
                    serviceAreas: [],
                    portfolio: [],
                    ratings: {
                        overall: 0,
                        quality: 0,
                        timeliness: 0,
                        communication: 0,
                        reviewCount: 0
                    }
                };

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(defaultProfile)
                };
            } catch (error) {
                console.error('Get builder profile error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to get profile' })
                };
            }
        }

        if (path.match(/^\/(?:prod\/)?builder\/profile$/) && method === 'PUT') {
            try {
                const user = await requireAuth(event);
                
                if (user.userType !== 'builder') {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Access denied. Builder account required.' })
                    };
                }

                const updates = JSON.parse(body);
                
                // For now, just return success - in a real implementation, 
                // you'd store this in a builder-profiles table
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, message: 'Profile updated successfully' })
                };
            } catch (error) {
                console.error('Update builder profile error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to update profile' })
                };
            }
        }
        console.log('ERROR: Route not found');
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ 
                error: 'Not found', 
                path: path, 
                method: method,
                availablePaths: ['/health', '/auth/register', '/auth/login', '/auth/confirm', '/auth/resend-confirmation', '/auth/forgot-password', '/auth/reset-password', '/projects', '/projects/validate-address', '/projects/invite-builder', '/projects/remove-builder', '/projects/access', '/documents/upload-url', '/documents/*/confirm', '/projects/*/documents', '/documents/*', '/projects/*/sow/generate', '/projects/*/sow/*/status', '/projects/*/sow/*', '/projects/*/sow/*/process', '/builder/profile', '/builder/projects']
            })
        };

    } catch (error) {
        console.log('ERROR: Unhandled exception:', error);
        console.log('Stack trace:', error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
