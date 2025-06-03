'use client';

import { motion } from 'framer-motion';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Spotify Account Information',
          details: 'When you connect your Spotify account, we collect your basic profile information including your display name, email address, profile picture, and country. This information is provided by Spotify through their official API.'
        },
        {
          subtitle: 'Music Listening Data',
          details: 'We access your Spotify listening history including your top artists, top tracks, and music genres across different time periods (short-term and medium-term). This data is used solely to generate your personalized trading cards.'
        },
        {
          subtitle: 'Generated Content',
          details: 'We store the trading cards we generate for you, including the AI-generated images and associated metadata. This allows you to access your collection anytime.'
        }
      ]
    },
    {
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Card Generation',
          details: 'Your music data is analyzed to create personalized prompts for AI image generation. This includes determining themes, styles, and content based on your musical preferences.'
        },
        {
          subtitle: 'Service Improvement',
          details: 'We may analyze aggregated, anonymized usage patterns to improve our service, but we never share individual user data or personally identifiable information.'
        },
        {
          subtitle: 'Account Management',
          details: 'We use your basic profile information to manage your account, provide customer support, and ensure proper attribution of generated content.'
        }
      ]
    },
    {
      title: 'Data Sharing and Disclosure',
      content: [
        {
          subtitle: 'Third-Party Services',
          details: 'We use trusted third-party services including AWS for storage, Replicate for AI generation, and Vercel for hosting. These services are bound by strict data protection agreements.'
        },
        {
          subtitle: 'No Data Sales',
          details: 'We never sell, rent, or trade your personal information or music data to third parties for marketing or any other purposes.'
        },
        {
          subtitle: 'Legal Requirements',
          details: 'We may disclose information if required by law or to protect our rights, but we will make reasonable efforts to notify you unless prohibited by law.'
        }
      ]
    },
    {
      title: 'Data Security',
      content: [
        {
          subtitle: 'Encryption',
          details: 'All data transmission is encrypted using industry-standard TLS protocols. Your data is stored securely with encryption at rest.'
        },
        {
          subtitle: 'Access Controls',
          details: 'We implement strict access controls to ensure only authorized personnel can access user data, and only when necessary for service operations.'
        },
        {
          subtitle: 'Regular Security Reviews',
          details: 'We regularly review and update our security practices to ensure your data remains protected against emerging threats.'
        }
      ]
    },
    {
      title: 'Your Rights and Choices',
      content: [
        {
          subtitle: 'Data Access',
          details: 'You can access all your generated cards and associated data through your account dashboard at any time.'
        },
        {
          subtitle: 'Data Deletion',
          details: 'You can delete your account and all associated data at any time. You can also delete individual cards from your collection.'
        },
        {
          subtitle: 'Spotify Access Revocation',
          details: 'You can revoke SoundCard\'s access to your Spotify account at any time through your Spotify account settings. This will prevent new data collection but won\'t automatically delete existing data.'
        }
      ]
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
            <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Privacy
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Policy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Your privacy is fundamental to us. This policy explains how we collect, use, 
              and protect your data when you use SoundCard.
            </p>
            <p className="text-sm text-gray-400">
              Last updated: June 3, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Privacy at a Glance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <EyeIcon className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Read-Only Access</h3>
                <p className="text-gray-300 text-sm">We only read your Spotify data, never modify it</p>
              </div>
              <div className="text-center">
                <LockClosedIcon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Secure Storage</h3>
                <p className="text-gray-300 text-sm">Your data is encrypted and securely stored</p>
              </div>
              <div className="text-center">
                <ShieldCheckIcon className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">No Data Sales</h3>
                <p className="text-gray-300 text-sm">We never sell your information to third parties</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <h2 className="text-3xl font-bold text-white mb-6">{section.title}</h2>
                <div className="space-y-6">
                  {section.content.map((item, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-purple-300 mb-3">{item.subtitle}</h3>
                      <p className="text-gray-300 leading-relaxed">{item.details}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Retention */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Data Retention</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We retain your data only as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion to allow account recovery.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span><strong>Generated Cards:</strong> Stored indefinitely unless you delete them manually or delete your account.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span><strong>Music Data:</strong> Cached for up to 7 days for performance, then refreshed from Spotify as needed.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span><strong>Usage Analytics:</strong> Anonymized analytics data may be retained longer for service improvement purposes.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact and Updates */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Policy Updates</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this privacy policy from time to time. When we do, we&apos;ll post the 
                updated policy on this page and update the &ldquo;Last updated&rdquo; date. For significant changes, 
                we&apos;ll notify users via email or through our service.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have questions about this privacy policy or our data practices, 
                please don&apos;t hesitate to reach out to us.
              </p>
              <p className="text-sm text-gray-400">
                This policy governs your use of SoundCard and any related services we provide.
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
              Ready to Create Your Musical Identity?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Your privacy is protected. Your music is waiting to become art.
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