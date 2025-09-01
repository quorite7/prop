// Simple test for questionnaire endpoints
const handler = require('./index').handler;

async function testQuestionnaireEndpoints() {
    console.log('Testing questionnaire endpoints...');
    
    // Test health endpoint first
    const healthEvent = {
        httpMethod: 'GET',
        path: '/health',
        headers: {},
        body: null,
        queryStringParameters: null
    };
    
    try {
        const healthResponse = await handler(healthEvent);
        console.log('Health check:', healthResponse.statusCode);
        
        if (healthResponse.statusCode === 200) {
            console.log('✅ Health check passed');
        } else {
            console.log('❌ Health check failed');
        }
    } catch (error) {
        console.error('Health check error:', error.message);
    }
    
    // Test questionnaire start endpoint (will fail without auth, but should not crash)
    const questionnaireEvent = {
        httpMethod: 'POST',
        path: '/projects/test-project/questionnaire/start',
        headers: {},
        body: '{}',
        queryStringParameters: null
    };
    
    try {
        const questionnaireResponse = await handler(questionnaireEvent);
        console.log('Questionnaire start:', questionnaireResponse.statusCode);
        
        if (questionnaireResponse.statusCode === 401 || questionnaireResponse.statusCode === 403) {
            console.log('✅ Questionnaire endpoint properly requires auth');
        } else {
            console.log('❌ Questionnaire endpoint response:', questionnaireResponse.statusCode);
        }
    } catch (error) {
        console.error('Questionnaire endpoint error:', error.message);
    }
}

testQuestionnaireEndpoints().catch(console.error);
