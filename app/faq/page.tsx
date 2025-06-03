'use client';

import { motion } from 'framer-motion';
import { ChevronDownIcon, ShieldCheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

export default function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What data does SoundCard access from my Spotify account?',
      answer: 'We only access your basic profile information (name, email, profile picture) and your listening history including top artists, top tracks, and music genres. We never access your playlists, saved music, or make any changes to your account. All access is read-only and secure.'
    },
    {
      question: 'How does the AI generate my trading cards?',
      answer: 'Our AI analyzes your music data to understand your preferences across genres, artists, and listening patterns. It then creates unique artwork that reflects your musical personality, including custom creatures, attack names inspired by your favorite artists, and visual themes that match your music taste.'
    },
    {
      question: 'Can I generate multiple cards?',
      answer: 'Yes! Each time you generate a card, our AI creates something new based on your current listening data. Your music taste evolves, and so do your cards. You can generate as many cards as you want and build your personal collection.'
    },
    {
      question: 'Is my data safe and private?',
      answer: 'Absolutely. We use industry-standard security practices and only store the minimum data necessary to create your cards. Your Spotify credentials are handled through OAuth (we never see your password), and we don\'t share your personal information with third parties.'
    },
    {
      question: 'Why do I need to be manually approved?',
      answer: 'Due to Spotify\'s current policies, new apps are limited to 25 users in development mode. We\'re working on expanding access, but for now, each user needs to be manually added to our allowlist. Contact us to be added!'
    },
    {
      question: 'How often does my music data update?',
      answer: 'We fetch fresh data each time you generate a card, but Spotify\'s "top" data typically updates every few weeks. This means your cards will evolve as your listening habits change over time, creating a musical journey you can track.'
    },
    {
      question: 'Can I download my cards?',
      answer: 'Yes! All your generated cards are saved to your personal collection where you can view them anytime and download high-quality images. Perfect for sharing on social media or printing physical copies.'
    },
    {
      question: 'What if I don\'t have enough listening history?',
      answer: 'Spotify recommends having at least a few weeks of listening history for meaningful data. If you\'re a new Spotify user, try listening to music for a while and then come back to generate more personalized cards.'
    },
    {
      question: 'Are there different card styles?',
      answer: 'Yes! Our AI can generate cards in various styles including anime-inspired art, mystical fantasy themes, cyberpunk designs, classic trading card aesthetics, and more. The style often reflects the genres and energy of your music.'
    },
    {
      question: 'Can I share my cards?',
      answer: 'Absolutely! Your cards are designed to be shared. Show off your musical identity on social media, compare cards with friends, or use them as unique profile pictures. Each card is a conversation starter about your music taste.'
    },
    {
      question: 'Does this work with Spotify Free accounts?',
      answer: 'Yes! SoundCard works with both Spotify Free and Premium accounts. We only need access to your listening history and basic profile information, which is available regardless of your subscription type.'
    },
    {
      question: 'How long does it take to generate a card?',
      answer: 'Card generation typically takes 10-30 seconds. We fetch your latest Spotify data, analyze it for musical patterns, generate a custom prompt, and then create your unique artwork using AI. You\'ll see a progress indicator during the process.'
    },
    {
      question: 'What makes each card unique?',
      answer: 'Every card is personalized based on your specific music data. The creature design reflects your genres, attack names are inspired by your top artists, the visual style matches your music\'s energy, and even the card\'s stats can relate to your listening patterns. No two users will have identical cards.'
    },
    {
      question: 'Can I request specific card features?',
      answer: 'Currently, our AI automatically determines the best representation of your music taste. While you can\'t manually customize specific elements, generating multiple cards will give you variety as the AI explores different creative interpretations of your musical identity.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
            <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link>
            <Link href="/faq" className="text-purple-300 font-semibold">FAQ</Link>
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
            <QuestionMarkCircleIcon className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block mb-2">Frequently Asked</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Questions
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Got questions about SoundCard? We&apos;ve got answers. Find everything you need to know 
              about creating your musical trading cards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDownIcon 
                    className={`w-6 h-6 text-purple-400 transition-transform duration-200 flex-shrink-0 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === index ? 'auto' : 0,
                    opacity: openFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Privacy & Security</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your privacy and security are our top priorities. Here&apos;s how we protect your data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure Authentication</h3>
              <p className="text-gray-400 leading-relaxed">
                We use Spotify&apos;s official OAuth system. We never see your password and can only 
                access what you explicitly allow.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Read-Only Access</h3>
              <p className="text-gray-400 leading-relaxed">
                We only read your listening data. We never modify your playlists, saved music, 
                or any other part of your Spotify account.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Data Protection</h3>
              <p className="text-gray-400 leading-relaxed">
                Your data is encrypted and stored securely. We don&apos;t sell your information 
                or share it with third parties.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We&apos;re here to help! Reach out if you need assistance or want to be added to our allowlist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Try SoundCard
              </Link>
              <Link 
                href="/about"
                className="inline-block text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-full border border-gray-600 hover:border-gray-400 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}