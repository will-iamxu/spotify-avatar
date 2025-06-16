'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  MusicalNoteIcon, 
  CpuChipIcon, 
  SparklesIcon,
  ShareIcon,
  UserCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      icon: UserCircleIcon,
      title: 'Connect Your Spotify',
      description: 'Sign in with your Spotify account to give us access to your listening history. We only read your data—we never modify anything.',
      details: [
        'Secure OAuth authentication',
        'Read-only access to your music data',
        'No changes to your playlists or preferences'
      ]
    },
    {
      number: '02',
      icon: MusicalNoteIcon,
      title: 'We Analyze Your Music',
      description: 'Our system analyzes your top artists, tracks, and genres across different time periods to understand your unique musical DNA.',
      details: [
        'Short-term and medium-term listening patterns',
        'Genre classification and analysis',
        'Artist and track popularity metrics'
      ]
    },
    {
      number: '03',
      icon: CpuChipIcon,
      title: 'AI Creates Your Card',
      description: 'Advanced AI technology generates a unique trading card that represents your musical personality and listening habits.',
      details: [
        'Personalized creature design based on your genres',
        'Custom attacks inspired by your favorite artists',
        'Unique card styles and color schemes'
      ]
    },
    {
      number: '04',
      icon: PhotoIcon,
      title: 'Download & Collect',
      description: 'Your card is saved to your collection where you can view, download, and manage all your generated cards.',
      details: [
        'High-quality downloadable images',
        'Personal collection gallery',
        'Generate multiple cards for variety'
      ]
    },
    {
      number: '05',
      icon: ShareIcon,
      title: 'Share with Friends',
      description: 'Show off your musical identity by sharing your cards on social media or with fellow music lovers.',
      details: [
        'Social media ready formats',
        'Compare cards with friends',
        'Discover new music through others\' cards'
      ]
    }
  ];

  const cardStyles = [
    {
      name: 'Vibrant Anime',
      description: 'Bold, colorful anime-inspired artwork with dynamic poses and effects'
    },
    {
      name: 'Mystical Fantasy',
      description: 'Ethereal creatures with magical elements and dreamy backgrounds'
    },
    {
      name: 'Cyberpunk Future',
      description: 'Neon-lit, futuristic designs with electronic music vibes'
    },
    {
      name: 'Classic Trading Card',
      description: 'Traditional card game aesthetics with modern AI generation'
    },
    {
      name: 'Minimalist Modern',
      description: 'Clean, contemporary designs focusing on typography and geometry'
    },
    {
      name: 'Retro Vintage',
      description: 'Nostalgic styles inspired by classic album artwork and posters'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
            🎵 SoundCard
          </Link>
          <div className="flex space-x-6">
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            <Link href="/how-it-works" className="text-purple-300 font-semibold">How It Works</Link>
            <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              How It
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Works
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              From your Spotify data to personalized trading cards in just a few clicks. 
              Here&apos;s the magic behind transforming your music into art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-gray-600">{step.number}</div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center text-gray-400">
                        <ArrowRightIcon className="w-4 h-4 text-purple-400 mr-3" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-24 h-24 text-purple-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Card Styles Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Card Styles & Themes
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI generates cards in various styles, each reflecting different aspects of your musical personality.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cardStyles.map((style, index) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="mb-4">
                  <SparklesIcon className="w-10 h-10 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {style.name}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {style.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Details Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">The Technology Behind the Magic</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We use AI and music analysis to create personalized cards for each user.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <MusicalNoteIcon className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">Spotify Web API</h3>
              <p className="text-gray-400 leading-relaxed">
                We securely access your listening data through Spotify&apos;s official API, analyzing 
                your top artists, tracks, and genres across different time periods.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <CpuChipIcon className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">AI Image Generation</h3>
              <p className="text-gray-400 leading-relaxed">
                Advanced AI models create unique artwork based on your music data, generating 
                personalized creatures, attacks, and visual themes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <PhotoIcon className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">Cloud Storage</h3>
              <p className="text-gray-400 leading-relaxed">
                Your generated cards are securely stored in the cloud, allowing you to access 
                and download them anytime from your personal collection.
              </p>
            </motion.div>
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
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to See Your Music Come to Life?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              The process takes less than a minute. Connect your Spotify and generate your first card now.
            </p>
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}