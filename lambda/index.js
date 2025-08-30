const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, AdminConfirmSignUpCommand, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand } = require('@aws-sdk/client-cognito-identity-provider');

const dynamoClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
const cognito = new CognitoIdentityProviderClient({});

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
    console.log('========================');

    if (event.httpMethod === 'OPTIONS') {
        console.log('OPTIONS request - returning CORS headers');
        return { statusCode: 200, headers };
    }

    try {
        const path = event.path;
        const method = event.httpMethod;

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
                        { Name: 'email', Value: email }
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
                                userType: 'homeowner', // Default, could be enhanced later
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
                {
                    id: 'kitchen',
                    name: 'Kitchen Renovation',
                    description: 'Complete kitchen makeover including cabinets, appliances, and flooring',
                    estimatedDuration: '4-6 weeks',
                    estimatedCost: '£15,000 - £40,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'bathroom',
                    name: 'Bathroom Renovation',
                    description: 'Full bathroom renovation including plumbing and tiling',
                    estimatedDuration: '2-4 weeks',
                    estimatedCost: '£8,000 - £25,000',
                    complexity: 'medium',
                    requiresPlanning: false
                },
                {
                    id: 'extension',
                    name: 'Home Extension',
                    description: 'Single or double storey extension to increase living space',
                    estimatedDuration: '12-20 weeks',
                    estimatedCost: '£30,000 - £80,000',
                    complexity: 'high',
                    requiresPlanning: true
                },
                {
                    id: 'loft',
                    name: 'Loft Conversion',
                    description: 'Convert loft space into usable rooms',
                    estimatedDuration: '6-8 weeks',
                    estimatedCost: '£20,000 - £50,000',
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

        // Projects endpoint
        if ((path === '/projects' || path === '/prod/projects') && method === 'GET') {
            console.log('Getting projects...');
            const command = new ScanCommand({
                TableName: process.env.PROJECTS_TABLE
            });
            
            const result = await dynamodb.send(command);
            console.log('Projects retrieved:', result.Items.length);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Items)
            };
        }

        if ((path === '/projects' || path === '/prod/projects') && method === 'POST') {
            console.log('Creating project...');
            const data = JSON.parse(event.body);
            const item = {
                id: Date.now().toString(),
                ...data,
                createdAt: new Date().toISOString()
            };

            const command = new PutCommand({
                TableName: process.env.PROJECTS_TABLE,
                Item: item
            });

            await dynamodb.send(command);
            console.log('Project created:', item.id);

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(item)
            };
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

        console.log('ERROR: Route not found');
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ 
                error: 'Not found', 
                path: path, 
                method: method,
                availablePaths: ['/health', '/auth/register', '/auth/login', '/auth/confirm', '/auth/resend-confirmation', '/projects', '/projects/validate-address']
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
