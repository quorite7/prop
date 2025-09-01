// AI Questionnaire functions
async function generateAIQuestion(projectContext, previousResponses, currentQuestionIndex) {
    try {
        const prompt = `You are an AI assistant helping homeowners provide detailed information about their home improvement project. 

Project Context:
- Project Type: ${projectContext.projectType}
- Description: ${projectContext.description}
- Budget: ${projectContext.budget ? `£${projectContext.budget.min}-£${projectContext.budget.max}` : 'Not specified'}
- Timeline: ${projectContext.timeline || 'Not specified'}
- Property Address: ${JSON.stringify(projectContext.propertyAddress)}

Previous Responses: ${JSON.stringify(previousResponses)}

Current Question Index: ${currentQuestionIndex}

Generate the next relevant question to gather more specific details about this project. The question should be:
1. Specific to the project type
2. Build upon previous responses
3. Help create a comprehensive scope of work
4. Be clear and easy to understand

Respond with a JSON object containing:
{
  "question": {
    "id": "unique_question_id",
    "text": "The question text",
    "type": "text|multiple_choice|number|boolean|scale",
    "options": ["option1", "option2"] (only for multiple_choice),
    "required": true|false
  },
  "isComplete": false,
  "reasoning": "Why this question is important"
}

If you believe enough information has been gathered (typically after 8-12 questions), set isComplete to true.`;

        const bedrockService = require('./services/bedrockService');
        const response = await bedrockService.invoke('claude-3-haiku', prompt, { maxTokens: 1000 });

        // More capable - AmitD - Change Bedrock models in eu-west-2
        //const response = await bedrockService.invoke('claude-3-sonnet', prompt, { maxTokens: 2000 });

        // Amazon's model - AmitD - Change Bedrock models in eu-west-2
        //const response = await bedrockService.invoke('titan-text', prompt);
        
        return JSON.parse(response);
    } catch (error) {
        console.error('AI question generation error:', error);
        // Fallback to predefined questions
        return generateFallbackQuestion(projectContext, currentQuestionIndex);
    }
}

function generateFallbackQuestion(projectContext, currentQuestionIndex) {
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

    const questionIndex = Math.min(currentQuestionIndex, fallbackQuestions.length - 1);
    return {
        question: fallbackQuestions[questionIndex],
        isComplete: currentQuestionIndex >= fallbackQuestions.length - 1,
        reasoning: 'Fallback question due to AI service unavailability'
    };
}

// Questionnaire endpoints to add to the main handler

        // Start questionnaire - POST /projects/{projectId}/questionnaire/start
        if (path.match(/^\/(?:prod\/)?projects\/([^\/]+)\/questionnaire\/start$/) && method === 'POST') {
            try {
                const user = requireAuth(event);
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
                const user = requireAuth(event);
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
                const user = requireAuth(event);
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

                // Generate next question using AI
                const projectContext = {
                    projectType: project.projectType,
                    description: project.requirements?.description || '',
                    budget: project.requirements?.budget,
                    timeline: project.requirements?.timeline,
                    propertyAddress: project.propertyAddress,
                    documents: project.documents || []
                };

                const aiResponse = await generateAIQuestion(
                    projectContext,
                    session.responses,
                    session.currentQuestionIndex
                );

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
                const user = requireAuth(event);
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
                const response = {
                    ...requestData,
                    timestamp: new Date().toISOString()
                };

                // Update session with new response
                const result = await dynamodb.send(new UpdateCommand({
                    TableName: QUESTIONNAIRE_TABLE,
                    Key: { id: sessionId },
                    UpdateExpression: 'SET responses = list_append(if_not_exists(responses, :empty_list), :response), currentQuestionIndex = currentQuestionIndex + :inc, completionPercentage = :completion, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':response': [response],
                        ':inc': 1,
                        ':completion': Math.min(100, ((requestData.currentQuestionIndex || 0) + 1) * 10),
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
                const user = requireAuth(event);
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
