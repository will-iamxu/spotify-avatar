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
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'database',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('SignIn callback:', { user, account, profile });
            return true;
        },
        async session({ session, user }) {
            if (user) {
                session.user = user;
            }
            return session;
        },
    },
};