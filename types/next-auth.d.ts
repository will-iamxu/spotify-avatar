// Remove unused imports
import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt"; // Keep DefaultJWT as it's extended

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT { // Extend DefaultJWT
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user?: DefaultSession["user"];
  }
}

// Extend the Session type
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user?: DefaultSession["user"];
  }
}
