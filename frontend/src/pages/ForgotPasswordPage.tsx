import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import { Email, ArrowBack } from '@mui/icons-material';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await requestPasswordReset(data.email);
      setSuccess('Password reset code sent to your email. Please check your inbox.');
      
      // Redirect to reset password page after 3 seconds
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email: data.email 
          } 
        });
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToReset = () => {
    const email = getValues('email');
    if (email) {
      navigate('/reset-password', { 
        state: { 
          email 
        } 
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email address and we'll send you a code to reset your password
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register('email')}
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message || 'We\'ll send a reset code to this email'}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
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
                'Code Sent! Redirecting...'
              ) : (
                'Send Reset Code'
              )}
            </Button>

            {success && (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleContinueToReset}
                sx={{ mb: 3, py: 1.5 }}
              >
                Continue to Reset Password
              </Button>
            )}

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Remember your password?
              </Typography>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Back to Sign In
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
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
        >
          <ArrowBack fontSize="small" />
          Back to Home
        </Link>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
