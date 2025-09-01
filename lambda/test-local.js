const { handler } = require('./index.js');

// Test the document upload URL endpoint
async function testDocumentUpload() {
    const event = {
        httpMethod: 'POST',
        path: '/documents/upload-url',
        headers: {
            'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
            projectId: '1756681416474',
            fileName: 'test.pdf',
            fileSize: 174307,
            mimeType: 'application/pdf',
            documentType: 'Structural Calculations'
        })
    };

    try {
        const result = await handler(event);
        console.log('Status:', result.statusCode);
        console.log('Response:', JSON.parse(result.body));
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDocumentUpload();
