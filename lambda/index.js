const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand, AdminConfirmSignUpCommand, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');

const dynamoClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
const cognito = new CognitoIdentityProviderClient({});

// JWT validation and user extraction utilities
function extractUserFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
    }
    
    const token = authHeader.substring(7);
    try {
        // Basic JWT decode (for development - in production should use proper JWT verification)
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('JWT payload:', JSON.stringify(payload, null, 2));
        
        return {
            userId: payload.sub,
            email: payload.email,
            userType: payload['custom:user_type'] || payload['custom:userType'] || 'homeowner',
            username: payload['cognito:username'] || payload.username
        };
    } catch (error) {
        console.error('JWT decode error:', error);
        throw new Error('Invalid JWT token: ' + error.message);
    }
}

function requireAuth(event) {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
        throw new Error('Authorization header required');
    }
    return extractUserFromToken(authHeader);
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
                const user = requireAuth(event);
                console.log('Authenticated user:', user.userId, user.userType);
                
                // Query projects by userId (homeowners see only their projects)
                if (user.userType === 'homeowner') {
                    try {
                        // Try using GSI first
                        const command = new QueryCommand({
                            TableName: process.env.PROJECTS_TABLE,
                            IndexName: 'UserIdIndex',
                            KeyConditionExpression: 'userId = :userId',
                            ExpressionAttributeValues: {
                                ':userId': user.userId
                            }
                        });
                        
                        const result = await dynamodb.send(command);
                        console.log('Projects retrieved for homeowner via GSI:', result.Items.length);
                        
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify(result.Items)
                        };
                    } catch (gsiError) {
                        console.log('GSI not ready, falling back to scan with filter:', gsiError.message);
                        
                        // Fallback to scan with filter if GSI is not ready
                        const scanCommand = new ScanCommand({
                            TableName: process.env.PROJECTS_TABLE,
                            FilterExpression: 'userId = :userId',
                            ExpressionAttributeValues: {
                                ':userId': user.userId
                            }
                        });
                        
                        const scanResult = await dynamodb.send(scanCommand);
                        console.log('Projects retrieved for homeowner via scan:', scanResult.Items.length);
                        
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify(scanResult.Items)
                        };
                    }
                } else if (user.userType === 'builder') {
                    // Builders see only projects they've been invited to
                    // For now, return empty array until invitation system is implemented
                    console.log('Builder access - returning empty array until invitation system implemented');
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify([])
                    };
                } else {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ error: 'Invalid user type' })
                    };
                }
            } catch (error) {
                console.error('Authentication or database error:', error.message);
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Unauthorized: ' + error.message })
                };
            }
        }

        // Projects endpoint - POST (requires authentication)
        if ((path === '/projects' || path === '/prod/projects') && method === 'POST') {
            console.log('Creating project...');
            
            try {
                const user = requireAuth(event);
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

        console.log('ERROR: Route not found');
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ 
                error: 'Not found', 
                path: path, 
                method: method,
                availablePaths: ['/health', '/auth/register', '/auth/login', '/auth/confirm', '/auth/resend-confirmation', '/auth/forgot-password', '/auth/reset-password', '/projects', '/projects/validate-address']
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
