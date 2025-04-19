'use client'; // Make this a client component to use onClick

import { signIn } from 'next-auth/react'; // Import signIn

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md text-center">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          Spotify AI Avatar
        </h1>
        <p className="text-gray-300 mb-8">
          Visualize your musical taste like never before. Log in to generate a unique AI avatar based on your listening history.
        </p>

        <button
          onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })} // Sign in with spotify provider
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Login with Spotify
        </button>
      </div>
    </main>
  );
}
