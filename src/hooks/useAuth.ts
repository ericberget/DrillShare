'use client';

import { useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { seedUserStarterContent } from '@/services/contentService';
import { createUserDocument, createOrUpdateUserDocument } from '@/services/userService';
import { useToast } from '@/contexts/ToastContext';

export interface AuthError {
  code: string;
  message: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  const { showToast, hideToast } = useToast();

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    setError(null);
    showToast('Creating your account...', 'loading', 0, true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (displayName) {
        await firebaseUpdateProfile(user, { displayName });
      }
      
      // Create user document in Firestore
      showToast('Setting up your profile...', 'loading', 0, true);
      await createUserDocument(
        user.uid,
        user.email || email,
        displayName || user.displayName || 'User',
        user.photoURL || undefined,
        user.emailVerified
      );
      
      // Show toast that we're preparing content
      showToast('Adding starter videos to your library...', 'loading', 0, true);
      
      // Navigate immediately
      router.push('/');
      
      // Handle content seeding in the background
      setTimeout(() => {
        seedUserStarterContent(userCredential.user.uid)
          .then(() => {
            showToast('Starter videos added to your library!', 'success');
            console.log('Starter content seeding completed successfully');
          })
          .catch(seedError => {
            showToast('Your account is ready! You can add your own videos anytime.', 'error');
            console.error('Error seeding starter content:', {
              error: seedError,
              userId: userCredential.user.uid
            });
          });
      }, 100);
      
      return userCredential.user;
    } catch (err: any) {
      hideToast();
      setError({
        code: err.code,
        message: getErrorMessage(err.code)
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    showToast('Signing in...', 'loading', 0, true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create or update user document in Firestore
      showToast('Setting up your profile...', 'loading', 0, true);
      await createOrUpdateUserDocument(
        user.uid,
        user.email || email,
        user.displayName || 'User',
        user.photoURL || undefined,
        user.emailVerified
      );
      
      showToast('Sign in successful!', 'success');
      router.push('/');
      return userCredential.user;
    } catch (err: any) {
      hideToast();
      console.error('Sign in error details:', {
        code: err.code,
        message: err.message,
        fullError: err
      });
      setError({
        code: err.code,
        message: getErrorMessage(err.code)
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    let userCredential: any = null;
    
    showToast('Signing in with Google...', 'loading', 0, true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Starting Google sign-in process...');
      
      // First handle the authentication
      try {
        userCredential = await signInWithPopup(auth, provider);
        console.log('Google authentication successful');
      } catch (authError: any) {
        hideToast();
        console.error('Google authentication error:', {
          code: authError.code,
          message: authError.message,
          fullError: authError
        });
        setError({
          code: authError.code,
          message: getErrorMessage(authError.code)
        });
        throw authError;
      }

      // Create or update user document in Firestore
      const user = userCredential.user;
      showToast('Setting up your profile...', 'loading', 0, true);
      await createOrUpdateUserDocument(
        user.uid,
        user.email || '',
        user.displayName || 'User',
        user.photoURL || undefined,
        user.emailVerified
      );

      // Show toast that we're preparing content
      showToast('Adding starter videos to your library...', 'loading', 0, true);

      // Navigate immediately after authentication
      console.log('Navigating to home page...');
      router.push('/');
      
      // Then handle the content seeding in the background
      setTimeout(() => {
        seedUserStarterContent(userCredential.user.uid)
          .then(() => {
            showToast('Starter videos added to your library!', 'success');
            console.log('Starter content seeding completed successfully');
          })
          .catch(seedError => {
            showToast('Your account is ready! You can add your own videos anytime.', 'error');
            console.error('Error seeding starter content:', {
              error: seedError,
              userId: userCredential.user.uid
            });
          });
      }, 100);

      return userCredential.user;
    } catch (err: any) {
      hideToast();
      console.error('Google sign in process failed:', {
        code: err.code,
        message: err.message,
        fullError: err
      });
      setError({
        code: err.code,
        message: getErrorMessage(err.code)
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError({
        code: err.code,
        message: getErrorMessage(err.code)
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push('/auth/signin');
    } catch (err: any) {
      setError({
        code: err.code,
        message: getErrorMessage(err.code)
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { displayName?: string, photoURL?: string }) => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) throw new Error('No user logged in');
      await firebaseUpdateProfile(auth.currentUser, data);
    } catch (err: any) {
      setError({
        code: err.code,
        message: getErrorMessage(err.code)
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    signOut,
    updateProfile,
    loading,
    error
  };
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password is too weak (minimum 6 characters)';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign in popup was closed. Please try again.';
    default:
      return `Authentication error: ${code}. Please try again.`;
  }
} 