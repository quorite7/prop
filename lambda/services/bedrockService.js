const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class BedrockService {
    constructor() {
        this.client = new BedrockRuntimeClient({ region: 'eu-west-2' });
        this.models = {
            'claude-3-haiku': 'anthropic.claude-3-haiku-20240307-v1:0',
            'claude-3-sonnet': 'anthropic.claude-3-sonnet-20240229-v1:0',
            'claude-3-opus': 'anthropic.claude-3-opus-20240229-v1:0',
            'claude-3-5-sonnet': 'anthropic.claude-3-5-sonnet-20240620-v1:0',
            'titan-text': 'amazon.titan-text-express-v1',
            'llama2-13b': 'meta.llama2-13b-chat-v1',
            'llama2-70b': 'meta.llama2-70b-chat-v1'
        };
    }

    async invoke(modelKey, prompt, options = {}) {
        const modelId = this.models[modelKey];
        if (!modelId) {
            throw new Error(`Model '${modelKey}' not found. Available: ${Object.keys(this.models).join(', ')}`);
        }

        const body = this.formatPrompt(modelKey, prompt, options);
        
        const command = new InvokeModelCommand({
            modelId,
            body: JSON.stringify(body),
            contentType: 'application/json'
        });

        const response = await this.client.send(command);
        return this.parseResponse(modelKey, response);
    }

    formatPrompt(modelKey, prompt, options) {
        if (modelKey.startsWith('claude')) {
            return {
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: options.maxTokens || 1000,
                messages: [{ role: "user", content: prompt }],
                temperature: options.temperature || 0.7
            };
        }
        
        if (modelKey === 'titan-text') {
            return {
                inputText: prompt,
                textGenerationConfig: {
                    maxTokenCount: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7
                }
            };
        }
        
        if (modelKey.startsWith('llama')) {
            return {
                prompt,
                max_gen_len: options.maxTokens || 1000,
                temperature: options.temperature || 0.7
            };
        }
        
        throw new Error(`Unsupported model format: ${modelKey}`);
    }

    parseResponse(modelKey, response) {
        const body = JSON.parse(new TextDecoder().decode(response.body));
        
        if (modelKey.startsWith('claude')) {
            return body.content[0].text;
        }
        
        if (modelKey === 'titan-text') {
            return body.results[0].outputText;
        }
        
        if (modelKey.startsWith('llama')) {
            return body.generation;
        }
        
        throw new Error(`Unsupported response format: ${modelKey}`);
    }

    getAvailableModels() {
        return Object.keys(this.models);
    }
}

module.exports = new BedrockService();
