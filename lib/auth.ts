/**
 * NextAuth.js configuration for Spotify OAuth authentication
 * 
 * This module configures authentication using Spotify's OAuth provider with database sessions.
 * It handles user sign-in, token management, and session creation for the SoundCard application.
 * 
 * @module auth
 */

import { AuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { DynamicPrismaAdapter } from './dynamic-prisma-adapter';

/**
 * TypeScript interface for Spotify user profile data
 * 
 * @interface SpotifyProfile
 * @property {string} id - Spotify user ID
 * @property {string} display_name - User's display name on Spotify
 * @property {string} email - User's email address
 * @property {Array<{url: string}>} images - Array of profile image objects
 */
interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

/**
 * Spotify OAuth scopes required for the application
 * 
 * - user-read-private: Access to user's basic profile information
 * - user-read-email: Access to user's email address
 * - user-top-read: Access to user's top artists and tracks
 */
const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
].join(',');

/**
 * NextAuth.js authentication configuration
 * 
 * Configures Spotify OAuth authentication with database-based sessions.
 * Includes custom callbacks for enhanced logging and error handling.
 * 
 * @constant {AuthOptions} authOptions - Complete NextAuth configuration object
 */
export const authOptions: AuthOptions = {
    // Use Dynamic Prisma adapter for database-based sessions with Secrets Manager
    adapter: DynamicPrismaAdapter(),
    
    // Configure Spotify OAuth provider
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: `https://accounts.spotify.com/authorize?scope=${scopes}`,
        }),
    ],
    
    // NextAuth secret for JWT encryption
    secret: process.env.NEXTAUTH_SECRET,
    
    // Enable debug logging for production troubleshooting
    debug: true,
    
    // Use database-based sessions for better persistence
    session: {
        strategy: 'database',
    },
    
    // Custom callbacks for enhanced functionality
    callbacks: {
        /**
         * Custom sign-in callback with enhanced logging and error handling
         * 
         * @param {Object} params - Sign-in callback parameters
         * @param {Object} params.user - User object from OAuth provider
         * @param {Object} params.account - Account object with OAuth tokens
         * @param {Object} params.profile - Full profile data from OAuth provider
         * @returns {Promise<boolean>} - Whether sign-in should proceed
         */
        async signIn({ user, account, profile }) {
            try {
                console.log('SignIn callback started:', { 
                    userId: user?.id, 
                    email: user?.email,
                    provider: account?.provider 
                });
                
                // Log Spotify ID for future reference and debugging
                if (account?.provider === 'spotify' && (profile as SpotifyProfile)?.id) {
                    console.log('Updating user with Spotify ID:', (profile as SpotifyProfile).id);
                }
                
                return true;
            } catch (error) {
                console.error('SignIn callback error:', error);
                return false;
            }
        },
        
        /**
         * Custom session callback to attach user data
         * 
         * @param {Object} params - Session callback parameters
         * @param {Object} params.session - Current session object
         * @param {Object} params.user - User data from database
         * @returns {Promise<Object>} - Modified session object
         */
        async session({ session, user }) {
            try {
                if (user) {
                    session.user = user;
                }
                return session;
            } catch (error) {
                console.error('Session callback error:', error);
                return session;
            }
        },
    },
    
    // Custom error page configuration
    pages: {
        error: '/api/auth/signin',
    },
};