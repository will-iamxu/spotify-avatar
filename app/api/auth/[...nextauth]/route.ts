import NextAuth, { AuthOptions, Account, User, Session } from 'next-auth'; // Import Session type
import { JWT } from 'next-auth/jwt';
import SpotifyProvider from 'next-auth/providers/spotify';
import SpotifyWebApi from 'spotify-web-api-node';

const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
].join(',');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        spotifyApi.setAccessToken(token.accessToken as string);
        spotifyApi.setRefreshToken(token.refreshToken as string);

        const { body: refreshedTokens } = await spotifyApi.refreshAccessToken();
        console.log('Refreshed tokens:', refreshedTokens);

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            // Keep original refresh token if the new response doesn't include one
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError', // Add error flag
        };
    }
}

const authOptions: AuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: `https://accounts.spotify.com/authorize?scope=${scopes}`,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account, user }: { token: JWT; account: Account | null; user: User | null }): Promise<JWT> {
            // Initial sign in
            if (account && user) {
                return {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,
                    user, // Keep user info if needed
                };
            }

            // Return previous token if the access token has not expired yet
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to update it
            console.log('Access token expired, refreshing...');
            return await refreshAccessToken(token);
        },
        // Update session callback signature
        async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
            // Assign custom properties from token to the session object
            // TypeScript should now recognize these properties from next-auth.d.ts
            session.accessToken = token.accessToken;
            session.user = token.user;
            session.error = token.error;
            return session; // Return the augmented session object
        },
    },
    // Optional: Add custom pages if needed
    // pages: {
    //   signIn: '/auth/signin',
    // }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
