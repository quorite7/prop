export interface User {
  id: string;
  email: string;
  userType: 'homeowner' | 'builder' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
  };
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'homeowner' | 'builder';
  phone?: string;
  companyName?: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  private baseUrl = process.env.REACT_APP_API_URL || 'https://dkjzt6ibsj.execute-api.eu-west-2.amazonaws.com/prod';
  private tokens: AuthTokens | null = null;

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<{ user: User; requiresConfirmation: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          userType: userData.userType,
          profile: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            companyName: userData.companyName,
          },
          gdprConsent: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      if (result.success) {
        const user: User = {
          id: result.data.user.email,
          email: result.data.user.email,
          userType: result.data.user.userType,
          profile: result.data.user.profile,
          emailVerified: result.data.user.emailVerified,
        };

        return {
          user,
          requiresConfirmation: !result.data.user.emailVerified,
        };
      }

      throw new Error('Registration failed');
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Confirm user registration
   */
  async confirmRegistration(email: string, confirmationCode: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          confirmationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Confirmation failed');
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Confirmation failed');
      }
    } catch (error: any) {
      console.error('Confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Resend confirmation code
   */
  async resendConfirmationCode(email: string): Promise<void> {
    try {
      // For now, we'll use the same endpoint as registration to trigger a new code
      // In a real implementation, you'd have a separate resend endpoint
      const response = await fetch(`${this.baseUrl}/auth/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend confirmation code');
      }
    } catch (error: any) {
      console.error('Resend confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Login failed');
      }

      if (result.success) {
        this.tokens = result.data.tokens;
        
        // Store tokens in localStorage
        localStorage.setItem('authTokens', JSON.stringify(this.tokens));

        const user: User = {
          id: result.data.user.email,
          email: result.data.user.email,
          userType: result.data.user.userType,
          profile: result.data.user.profile,
          emailVerified: result.data.user.emailVerified,
        };

        return {
          user,
          tokens: this.tokens!,
        };
      }

      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      this.tokens = null;
      localStorage.removeItem('authTokens');
    } catch (error: any) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens) {
        throw new Error('No authentication tokens found');
      }

      // For now, decode the user info from the stored tokens
      // In a real implementation, you'd validate the token with the server
      const payload = this.decodeJWT(tokens.idToken);
      
      const user: User = {
        id: payload.email || payload.sub,
        email: payload.email,
        userType: payload['custom:userType'] || 'homeowner',
        profile: {
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          phone: payload.phone_number,
          companyName: payload['custom:companyName'],
        },
        emailVerified: payload.email_verified === 'true',
      };

      return user;
    } catch (error: any) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens) {
        return false;
      }

      // Check if token is expired
      const payload = this.decodeJWT(tokens.accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    throw new Error('Change password not implemented yet');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Password reset request failed');
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Password reset request failed');
      }
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          confirmationCode: code,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Password reset confirmation failed');
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Password reset confirmation failed');
      }
    } catch (error: any) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens) {
        return null;
      }

      // Check if token is expired
      const payload = this.decodeJWT(tokens.accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp <= currentTime) {
        // Token is expired, clear it
        this.logout();
        return null;
      }

      return tokens.accessToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get stored tokens from localStorage
   */
  private getStoredTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem('authTokens');
      if (stored) {
        this.tokens = JSON.parse(stored);
        return this.tokens;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode JWT token (simple implementation)
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService();
