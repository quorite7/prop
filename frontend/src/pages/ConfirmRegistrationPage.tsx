import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { builderInvitationService } from '../services/builderInvitationService';
import { Email, Refresh } from '@mui/icons-material';

const schema = yup.object({
  confirmationCode: yup
    .string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Verification code must be 6 digits'),
});

interface ConfirmFormData {
  confirmationCode: string;
}

const ConfirmRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmRegistration, resendConfirmationCode, login } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get data from navigation state
  const email = location.state?.email;
  const userType = location.state?.userType || 'homeowner';
  const invitationCode = location.state?.invitationCode;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConfirmFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ConfirmFormData) => {
    if (!email) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await confirmRegistration(email, data.confirmationCode, invitationCode);
      setSuccess('Email verified successfully!');
      
      // For builders with invitation codes, auto-login and accept invitation
      if (userType === 'builder' && invitationCode) {
        try {
          // Auto-login (this is a simplified approach - in production you might want to handle this differently)
          setTimeout(async () => {
            try {
              // Accept the invitation
              await builderInvitationService.acceptInvitation(invitationCode);
              navigate('/app/builder/dashboard');
            } catch (inviteErr) {
              console.error('Failed to accept invitation:', inviteErr);
              navigate('/login', { 
                state: { 
                  email, 
                  message: 'Registration confirmed! Please sign in and use your invitation code from the dashboard.' 
                } 
              });
            }
          }, 2000);
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
          navigate('/login', { 
            state: { 
              email, 
              message: 'Registration confirmed! Please sign in to access your invited project.' 
            } 
          });
        }
      } else {
        // Regular homeowner flow
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              email, 
              message: 'Registration confirmed! Please sign in with your credentials.' 
            } 
          });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await resendConfirmationCode(email);
      setSuccess('Verification code sent! Please check your email.');
      setResendCooldown(60); // 60 second cooldown
      reset(); // Clear the form
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect to register
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Verify Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              We've sent a 6-digit verification code to:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {email}
            </Typography>
            
            {userType === 'builder' && invitationCode && (
              <Alert severity="info" sx={{ mt: 2 }}>
                After verification, you'll automatically get access to your invited project.
              </Alert>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
              {userType === 'builder' && invitationCode && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Redirecting to your builder dashboard...
                </Typography>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register('confirmationCode')}
              fullWidth
              label="Verification Code"
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              autoFocus
              error={!!errors.confirmationCode}
              helperText={errors.confirmationCode?.message || 'Check your email for the 6-digit code'}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    #
                  </InputAdornment>
                ),
              }}
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric',
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !!success}
              sx={{ mb: 3, py: 1.5 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : success ? (
                'Verified! Redirecting...'
              ) : (
                'Verify Email'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Didn't receive the code?
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0 || !!success}
              startIcon={isResending ? <CircularProgress size={16} /> : <Refresh />}
              sx={{ mb: 3 }}
            >
              {isResending ? (
                'Sending...'
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend Code'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Need to use a different email?
              </Typography>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Register with different email
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Link
          component={RouterLink}
          to="/"
          variant="body2"
          underline="hover"
          color="text.secondary"
        >
          ← Back to Home
        </Link>
      </Box>
    </Container>
  );
};

export default ConfirmRegistrationPage;
