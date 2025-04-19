import { Suspense } from 'react';
import DashboardClient from './DashboardClient'; // Import the new client component

// Define a simple loading component for the Suspense fallback
function LoadingFallback() {
    return (
        <div className="w-full max-w-lg p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md text-center">
            <h1 className="text-3xl font-bold mb-6">Generate Your Spotify Avatar</h1>
            <p className="text-blue-300 mb-4">Loading dashboard...</p>
        </div>
    );
}

// This page component can now be a Server Component (or just simpler)
export default function DashboardPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            {/* Wrap the client component that uses useSearchParams in Suspense */}
            <Suspense fallback={<LoadingFallback />}>
                <DashboardClient />
            </Suspense>
        </main>
    );
}

