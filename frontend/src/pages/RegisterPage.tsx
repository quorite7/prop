import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormHelperText,
  Collapse,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { builderInvitationService } from '../services/builderInvitationService';

const baseSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  userType: yup
    .string()
    .oneOf(['homeowner', 'builder'], 'Please select a user type')
    .required('User type is required'),
  phone: yup
    .string()
    .matches(/^(\+44|0)[0-9]{10,11}$/, 'Please enter a valid UK phone number')
    .optional(),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms and conditions'),
  agreeToPrivacy: yup
    .boolean()
    .oneOf([true], 'You must agree to the privacy policy'),
});

const builderSchema = baseSchema.shape({
  invitationCode: yup
    .string()
    .when('userType', {
      is: 'builder',
      then: (schema) => schema.required('Invitation code is required for builders'),
      otherwise: (schema) => schema.optional(),
    }),
  companyName: yup
    .string()
    .when('userType', {
      is: 'builder',
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.optional(),
    }),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitationValidated, setInvitationValidated] = useState(false);
  const [projectInfo, setProjectInfo] = useState<{ projectId: string; projectTitle: string } | null>(null);
  const [validatingInvitation, setValidatingInvitation] = useState(false);

  // Get invitation code from URL if present
  const urlInvitationCode = searchParams.get('code');

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(builderSchema),
    defaultValues: {
      userType: 'homeowner',
      agreeToTerms: false,
      agreeToPrivacy: false,
      invitationCode: urlInvitationCode || '',
    },
  });

  const userType = watch('userType');
  const invitationCode = watch('invitationCode');

  // Auto-validate invitation code when it changes (for builders)
  useEffect(() => {
    if (userType === 'builder' && invitationCode && invitationCode.length === 8) {
      validateInvitationCode(invitationCode);
    } else {
      setInvitationValidated(false);
      setProjectInfo(null);
    }
  }, [invitationCode, userType]);

  // Set invitation code from URL when user type changes to builder
  useEffect(() => {
    if (userType === 'builder' && urlInvitationCode && !invitationCode) {
      setValue('invitationCode', urlInvitationCode);
    }
  }, [userType, urlInvitationCode, invitationCode, setValue]);

  const validateInvitationCode = async (code: string) => {
    if (!code || code.length !== 8) return;

    setValidatingInvitation(true);
    setError('');

    try {
      const result = await builderInvitationService.validateInvitation(code);
      if (result.valid) {
        setInvitationValidated(true);
        setProjectInfo({ projectId: result.projectId!, projectTitle: result.projectTitle! });
      } else {
        setInvitationValidated(false);
        setProjectInfo(null);
        setError('Invalid or expired invitation code');
      }
    } catch (err: any) {
      setInvitationValidated(false);
      setProjectInfo(null);
      setError(err.response?.data?.error || 'Failed to validate invitation code');
    } finally {
      setValidatingInvitation(false);
    }
  };

  const onSubmit = async (data: any) => {
    // For builders, ensure invitation is validated
    if (data.userType === 'builder' && !invitationValidated) {
      setError('Please enter a valid invitation code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        userType: data.userType,
        phone: data.phone,
        companyName: data.companyName,
      });

      if (result.needsConfirmation) {
        // Redirect to confirmation page with email and invitation code
        navigate('/confirm-registration', { 
          state: { 
            email: data.email,
            userType: data.userType,
            invitationCode: data.userType === 'builder' ? data.invitationCode : undefined,
          } 
        });
      } else {
        // User is already confirmed
        if (data.userType === 'builder' && data.invitationCode) {
          // Accept the invitation
          try {
            await builderInvitationService.acceptInvitation(data.invitationCode);
            navigate('/app/builder/dashboard');
          } catch (err) {
            console.error('Failed to accept invitation:', err);
            navigate('/app/dashboard');
          }
        } else {
          navigate('/app/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Create Your Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {userType === 'builder' 
                ? 'Join as a builder and access project invitations'
                : 'Join thousands of UK homeowners planning their projects'
              }
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend">I am a:</FormLabel>
              <Controller
                name="userType"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel
                      value="homeowner"
                      control={<Radio />}
                      label="Homeowner"
                    />
                    <FormControlLabel
                      value="builder"
                      control={<Radio />}
                      label="Builder/Contractor"
                    />
                  </RadioGroup>
                )}
              />
              {errors.userType && (
                <FormHelperText error>{errors.userType.message}</FormHelperText>
              )}
            </FormControl>

            {/* Builder Invitation Code Section */}
            <Collapse in={userType === 'builder'}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  {...register('invitationCode')}
                  fullWidth
                  label="Invitation Code"
                  placeholder="Enter 8-character code"
                  error={!!errors.invitationCode}
                  helperText={errors.invitationCode?.message || 'Required to register as a builder'}
                  inputProps={{ 
                    style: { textTransform: 'uppercase' },
                    maxLength: 8 
                  }}
                  InputProps={{
                    endAdornment: validatingInvitation ? (
                      <CircularProgress size={20} />
                    ) : invitationValidated ? (
                      <Chip label="Valid" color="success" size="small" />
                    ) : null
                  }}
                />
                
                {projectInfo && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    ✓ Valid invitation for: <strong>{projectInfo.projectTitle}</strong>
                  </Alert>
                )}
              </Box>
            </Collapse>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                {...register('firstName')}
                fullWidth
                label="First Name"
                autoComplete="given-name"
                autoFocus
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <TextField
                {...register('lastName')}
                fullWidth
                label="Last Name"
                autoComplete="family-name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Box>

            <TextField
              {...register('email')}
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 3 }}
            />

            {/* Company Name for Builders */}
            <Collapse in={userType === 'builder'}>
              <TextField
                {...register('companyName')}
                fullWidth
                label="Company Name (Optional)"
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                sx={{ mb: 3 }}
              />
            </Collapse>

            <TextField
              {...register('phone')}
              fullWidth
              label="Phone Number (Optional)"
              type="tel"
              autoComplete="tel"
              placeholder="+44 or 0..."
              error={!!errors.phone}
              helperText={errors.phone?.message || 'UK phone number format'}
              sx={{ mb: 3 }}
            />

            <TextField
              {...register('password')}
              fullWidth
              label="Password"
              type="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
            />

            <TextField
              {...register('confirmPassword')}
              fullWidth
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Controller
                name="agreeToTerms"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} />}
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" underline="hover">
                          Terms and Conditions
                        </Link>
                      </Typography>
                    }
                  />
                )}
              />
              {errors.agreeToTerms && (
                <FormHelperText error>{errors.agreeToTerms.message}</FormHelperText>
              )}

              <Controller
                name="agreeToPrivacy"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} />}
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link href="/privacy" target="_blank" underline="hover">
                          Privacy Policy
                        </Link>{' '}
                        and consent to data processing
                      </Typography>
                    }
                  />
                )}
              />
              {errors.agreeToPrivacy && (
                <FormHelperText error>{errors.agreeToPrivacy.message}</FormHelperText>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || (userType === 'builder' && !invitationValidated)}
              sx={{ mb: 3, py: 1.5 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Create ${userType === 'homeowner' ? 'Homeowner' : 'Builder'} Account`
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to={`/login${urlInvitationCode ? `?code=${urlInvitationCode}` : ''}`}
                  variant="body2"
                  underline="hover"
                  sx={{ fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </Typography>
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

export default RegisterPage;
