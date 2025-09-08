const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

class CognitoJWTVerifier {
    constructor(userPoolId, region = 'eu-west-2') {
        this.userPoolId = userPoolId;
        this.region = region;
        this.jwksUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
        
        this.client = jwksClient({
            jwksUri: this.jwksUri,
            cache: true,
            cacheMaxAge: 600000, // 10 minutes
            rateLimit: true,
            jwksRequestsPerMinute: 10
        });
    }

    async getSigningKey(kid) {
        return new Promise((resolve, reject) => {
            this.client.getSigningKey(kid, (err, key) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(key.getPublicKey());
                }
            });
        });
    }

    async verifyToken(token) {
        try {
            // Decode header to get kid
            const decoded = jwt.decode(token, { complete: true });
            if (!decoded || !decoded.header.kid) {
                throw new Error('Invalid token format');
            }

            // Get signing key
            const signingKey = await this.getSigningKey(decoded.header.kid);

            // Check token type and set appropriate verification options
            const tokenUse = decoded.payload.token_use;
            let verifyOptions = {
                algorithms: ['RS256'],
                issuer: `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`
            };

            // Only verify audience for ID tokens, not access tokens
            if (tokenUse === 'id') {
                verifyOptions.audience = process.env.USER_POOL_CLIENT_ID;
            }

            // Verify token
            const payload = jwt.verify(token, signingKey, verifyOptions);

            // Get userType from token or fallback to Cognito query
            let userType = payload['custom:user_type'] || 'homeowner';
            
            // If userType not in token, query Cognito directly
            if (!payload['custom:user_type']) {
                try {
                    const { CognitoIdentityProviderClient, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
                    const cognito = new CognitoIdentityProviderClient({});
                    
                    // Use username instead of sub for Cognito query
                    const username = payload['cognito:username'] || payload.username;
                    
                    const result = await cognito.send(new AdminGetUserCommand({
                        UserPoolId: this.userPoolId,
                        Username: username
                    }));
                    
                    const userTypeAttr = result.UserAttributes?.find(attr => attr.Name === 'custom:user_type');
                    userType = userTypeAttr?.Value || 'homeowner';
                } catch (cognitoError) {
                    console.error('Error fetching user type from Cognito:', cognitoError);
                    // Keep default 'homeowner'
                }
            }

            return {
                sub: payload.sub,
                userId: payload.sub,
                email: payload.email,
                userType: userType,
                username: payload['cognito:username'] || payload.username,
                firstName: payload.given_name || '',
                lastName: payload.family_name || '',
                tokenUse: payload.token_use,
                exp: payload.exp,
                iat: payload.iat
            };
        } catch (error) {
            console.error('JWT verification failed:', error);
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
}

module.exports = { CognitoJWTVerifier };
