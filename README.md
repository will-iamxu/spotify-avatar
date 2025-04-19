# 🎶 Spotify Avatar Generator 🤖

Generate unique, AI-powered avatars based on your Spotify listening habits! ✨ This project connects to Spotify, analyzes your top music, and uses the Replicate API to create a personalized image.

## ✨ Features

*   🔒 Secure Spotify authentication via **NextAuth.js**.
*   🎧 Fetches your top Spotify artists/tracks.
*   🎨 Generates cool images using the **Replicate AI** platform.
*   🚀 Built with **Next.js** and **React**.

## 🛠️ Tech Stack

*   Framework: [Next.js](https://nextjs.org/)
*   UI Library: [React](https://reactjs.org/)
*   Authentication: [NextAuth.js](https://next-auth.js.org/)
*   APIs:
    *   [Spotify Web API](https://developer.spotify.com/documentation/web-api) (via `spotify-web-api-node` & NextAuth Provider)
    *   [Replicate](https://replicate.com/)
*   Styling: [Tailwind CSS](https://tailwindcss.com/) *(Optional - if used)*
*   Language: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### ✅ Prerequisites

*   Node.js (v18+ recommended)
*   `npm`, `yarn`, or `pnpm`
*   A [Spotify Developer](https://developer.spotify.com/dashboard/) account & registered app
*   A [Replicate](https://replicate.com/account) account & API token

### ⚙️ Installation

1.  **Clone the repo:**
    ```bash
    git clone <your-repository-url>
    cd spotify-avatar
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the project root:

    ```env
    # Spotify App Credentials (from Spotify Developer Dashboard)
    SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
    SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET

    # Public Spotify Client ID (same as above, exposed to browser)
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID

    # Replicate API Token (from Replicate)
    REPLICATE_API_TOKEN=YOUR_REPLICATE_API_TOKEN

    # NextAuth Secret (generate a strong secret!)
    # Example: openssl rand -base64 32
    NEXTAUTH_SECRET=YOUR_GENERATED_NEXTAUTH_SECRET

    # NextAuth URL (for local development)
    NEXTAUTH_URL=http://localhost:3000
    ```

    *   **Spotify Setup:** Get credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/). Add `http://localhost:3000/api/auth/callback/spotify` to your app's **Redirect URIs**.
    *   **Replicate Setup:** Get your API token from [Replicate account settings](https://replicate.com/account).
    *   **NextAuth Secret:** Generate a strong secret using `openssl rand -base64 32` or a similar tool.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    Navigate to 👉 [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables

*   `SPOTIFY_CLIENT_ID`: Spotify App Client ID.
*   `SPOTIFY_CLIENT_SECRET`: Spotify App Client Secret (**Keep this private!**).
*   `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`: Public Spotify Client ID.
*   `REPLICATE_API_TOKEN`: Replicate API Token (**Keep this private!**).
*   `NEXTAUTH_SECRET`: Session encryption key (**Use a unique, strong secret for production!**).
*   `NEXTAUTH_URL`: The canonical URL of your application (e.g., `http://localhost:3000` or `https://your-app.vercel.app`).

## ☁️ Deployment

Ready to deploy to the cloud? Platforms like [Vercel](https://vercel.com/) make it easy!

### Vercel Deployment Steps

1.  Push your code to GitHub/GitLab/Bitbucket.
2.  Import your repository into Vercel.
3.  Configure **Environment Variables** in Vercel project settings (Settings -> Environment Variables).
    *   Use the same variables as in `.env.local`.
    *   **Important:** Set `NEXTAUTH_URL` to your production Vercel URL (e.g., `https://your-app-name.vercel.app`).
    *   **Important:** Use a **different, strong** `NEXTAUTH_SECRET` for production.
    *   **Do not commit `.env.local`!**
4.  Deploy! 🚀
5.  **Final Step:** Update the **Redirect URI** in your Spotify application settings to include your Vercel deployment callback URL: `https://your-app-name.vercel.app/api/auth/callback/spotify`.

---

*(Optional: Add sections for Usage Guide, Contributing, License, etc.)*
