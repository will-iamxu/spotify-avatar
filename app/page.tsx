'use client';

import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { SparklesIcon, MusicalNoteIcon, UserGroupIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const features = [
    {
      icon: MusicalNoteIcon,
      title: 'Music DNA Analysis',
      description: 'Deep dive into your Spotify listening patterns and musical preferences.'
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates unique Pokémon-style trading cards based on your taste.'
    },
    {
      icon: UserGroupIcon,
      title: 'Share & Connect',
      description: 'Share your musical identity with friends and discover similar tastes.'
    },
    {
      icon: LightBulbIcon,
      title: 'Discover Insights',
      description: 'Learn about your music habits and get personalized recommendations.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            🎵 SoundCard
          </motion.div>
          <div className="flex space-x-6">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              Your Music,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Visualized
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your Spotify listening history into stunning AI-generated trading cards. 
              Discover your musical DNA and share your unique sound profile with the world.
            </p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-yellow-200 text-sm">
                ⚠️ <strong>Development Mode:</strong> Due to Spotify&apos;s new policies, new users must be manually approved. 
                Contact the developer to be added to the allowlist.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Connect with Spotify
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
            
            <Link 
              href="#demo" 
              className="text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-full border border-gray-600 hover:border-gray-400 transition-all duration-300"
            >
              See Demo
            </Link>
          </motion.div>
        </div>

        {/* Floating Animation Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 text-purple-400 text-6xl opacity-20"
          >
            🎵
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/3 right-1/4 text-pink-400 text-4xl opacity-20"
          >
            🎨
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute bottom-1/3 left-1/3 text-cyan-400 text-5xl opacity-20"
          >
            ⚡
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powered by Innovation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced AI technology meets your musical personality to create something truly unique.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="mb-6">
                  <feature.icon className="w-12 h-12 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Discover Your Musical DNA?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of music lovers who have already created their unique sound profiles.
            </p>
            <button
              onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
