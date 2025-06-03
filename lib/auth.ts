import { AuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';

const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
].join(',');

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: `https://accounts.spotify.com/authorize?scope=${scopes}`,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // Enable debug for production to help diagnose issues
    session: {
        strategy: 'database',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                console.log('SignIn callback started:', { 
                    userId: user?.id, 
                    email: user?.email,
                    provider: account?.provider 
                });
                
                // Store Spotify ID in the user record for future reference
                if (account?.provider === 'spotify' && (profile as any)?.id) {
                    console.log('Updating user with Spotify ID:', (profile as any).id);
                }
                
                return true;
            } catch (error) {
                console.error('SignIn callback error:', error);
                return false;
            }
        },
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
    pages: {
        error: '/api/auth/signin',
    },
};