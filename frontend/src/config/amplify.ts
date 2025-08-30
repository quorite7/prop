import { Amplify } from '@aws-amplify/core';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'eu-west-2_LY6wiylnT',
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '40t1l2d5m70t3cg0b39dvglkjs',
      identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID || 'eu-west-2:5b66590e-d479-43fa-96e4-5ee02c6db361',
    },
  },
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
