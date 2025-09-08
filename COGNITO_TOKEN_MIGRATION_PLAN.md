# Cognito Token Migration Plan

## Current State Analysis

✅ **Already Using Cognito Tokens**: Your system already uses Cognito's JWT tokens (IdToken, AccessToken, RefreshToken)
⚠️ **Security Gap**: Backend uses basic JWT decode instead of proper verification
✅ **Frontend Ready**: Already stores and uses Cognito tokens correctly
✅ **Infrastructure Ready**: Full Cognito setup deployed

## Migration Overview

**Complexity**: LOW-MEDIUM (mostly backend security improvements)
**Risk**: LOW (tokens already work, just improving validation)
**Downtime**: ZERO (rolling deployment)

## Phase 1: Backend Security Enhancement (RECOMMENDED)

### 1.1 Install Dependencies
```bash
cd lambda
npm install jsonwebtoken@^9.0.2 jwks-rsa@^3.1.0
```

### 1.2 Replace Token Validation
- ✅ Created: `lambda/cognito-jwt-verifier.js` (proper JWT verification)
- ⚠️ Manual: Update `extractUserFromToken` function in `lambda/index.js`
- ✅ Backup: `lambda/index.js.backup` created

### 1.3 Key Changes
```javascript
// OLD: Basic decode (security risk)
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

// NEW: Proper verification
const payload = await jwtVerifier.verifyToken(token);
```

### 1.4 Benefits
- ✅ Validates token signature against Cognito's public keys
- ✅ Checks token expiration
- ✅ Verifies issuer and audience
- ✅ Prevents token tampering

## Phase 2: Enhanced Token Management (OPTIONAL)

### 2.1 Add Token Refresh Logic
```javascript
// Frontend: Auto-refresh expired tokens
if (isTokenExpired(accessToken)) {
  await refreshTokens();
}
```

### 2.2 Add Token Caching
- Cache Cognito public keys (10 min TTL)
- Reduce verification latency

## Phase 3: Monitoring & Rollback

### 3.1 Monitoring
- Watch CloudWatch logs for JWT verification errors
- Monitor API response times
- Track authentication success rates

### 3.2 Rollback Plan
```bash
# If issues occur:
cp lambda/index.js.backup lambda/index.js
./deploy.sh
```

## Deployment Steps

### Step 1: Prepare
```bash
./migrate-to-cognito-tokens.sh
```

### Step 2: Manual Update (Required)
1. Open `lambda/index.js`
2. Find `function extractUserFromToken(authHeader) {`
3. Replace with content from `lambda/new-extract-function.js`
4. Change `function` to `async function`

### Step 3: Test Locally
```bash
cd lambda
node test-local.js
```

### Step 4: Deploy
```bash
./deploy.sh
```

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Token validation fails | Low | Medium | Rollback plan ready |
| Performance impact | Low | Low | Caching implemented |
| Breaking changes | Very Low | High | Same token format used |

## Testing Checklist

- [ ] Login still works
- [ ] Protected endpoints accessible
- [ ] Token expiration handled
- [ ] Invalid tokens rejected
- [ ] Performance acceptable

## Environment Variables Required

```bash
USER_POOL_ID=us-east-1_qOU1TiH38  # ✅ Already set
USER_POOL_CLIENT_ID=30iqneh7uuc5utohbsvhjthleh  # ✅ Already set
AWS_REGION=eu-west-2  # ✅ Already set
```

## Success Criteria

1. ✅ All existing functionality works
2. ✅ Tokens properly verified against Cognito
3. ✅ No performance degradation
4. ✅ Security improved (no more basic decode)

## Timeline

- **Preparation**: 15 minutes
- **Implementation**: 30 minutes  
- **Testing**: 15 minutes
- **Deployment**: 5 minutes
- **Total**: ~1 hour

## Recommendation

**PROCEED**: This migration significantly improves security with minimal risk. Your system is already 90% ready - just need to replace the insecure JWT decode with proper verification.

The current basic JWT decode is a security vulnerability that should be fixed regardless of other considerations.
