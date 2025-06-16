'use client';

import { motion } from 'framer-motion';
import { SparklesIcon, MusicalNoteIcon, CpuChipIcon, HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AboutPage() {

  const features = [
    {
      icon: MusicalNoteIcon,
      title: 'Deep Music Analysis',
      description: 'We analyze your Spotify listening history across multiple time periods to understand your unique musical DNA and preferences.'
    },
    {
      icon: CpuChipIcon,
      title: 'AI Card Generation',
      description: 'We use AI to turn your music data into custom trading card artwork that matches your taste.'
    },
    {
      icon: SparklesIcon,
      title: 'Unique Card Styles',
      description: 'Each card has different art styles, creatures, and themes based on your music preferences.'
    },
    {
      icon: HeartIcon,
      title: 'Built for Music Lovers',
      description: 'Created by music enthusiasts who understand the deep connection between identity and the songs that move us.'
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
            <Link href="/about" className="text-purple-300 font-semibold">About</Link>
            <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link>
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
              About
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                SoundCard
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              We believe your music taste is as unique as your fingerprint. SoundCard transforms your Spotify listening history 
              into personalized AI-generated trading cards that capture your musical identity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Music is more than entertainment—it&apos;s a reflection of who we are, where we&apos;ve been, 
                and where we&apos;re going. Every song in your playlist tells a story, every artist you love 
                represents a piece of your identity.
              </p>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                SoundCard was born from the idea that these musical connections deserve to be celebrated 
                and visualized in a way that&apos;s both personal and shareable. We wanted to create something 
                that goes beyond simple statistics—something that captures the emotion and artistry of your 
                musical journey.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                We analyze your music and turn it into collectible art that you can keep and share with other music fans.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Currently in Development</h3>
                  <p className="text-gray-300 mb-4">
                    We&apos;re actively working on expanding SoundCard into a full trading card game experience.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-yellow-200 text-sm">
                      🎴 <strong>Coming Soon:</strong> Trade cards with friends, battle with your musical creatures, 
                      and collect rare cards based on unique listening patterns!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We&apos;re not just another music app. We&apos;re artists, technologists, and music lovers 
              creating something truly unique for the community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300"
              >
                <div className="mb-6">
                  <feature.icon className="w-12 h-12 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Built with ❤️ for Music</h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              SoundCard is a passion project created by developers and designers who live and breathe music. 
              We understand that your playlist is personal, your taste is unique, and your musical journey 
              deserves to be celebrated.
            </p>
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <p className="text-xl text-white mb-4">
                &ldquo;Music gives a soul to the universe, wings to the mind, flight to the imagination, 
                and life to everything.&rdquo;
              </p>
              <p className="text-gray-400">— Plato</p>
            </div>
          </motion.div>
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
              Ready to Visualize Your Music?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the community of music lovers turning their playlists into art.
            </p>
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}