"use client";

import { motion } from "framer-motion";
import { Target, Code, ArrowRight, GitBranch, Zap, Shield, Mail } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-slate-50 overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-800/50 bg-[#020817]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Project<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Lens</span>
            </span>
          </div>

          {/* Middle - Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
            <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link 
              href="/signin" 
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold transition-all text-sm flex items-center shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transform hover:-translate-y-0.5"
            >
              Analyze Project <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="relative w-full rounded-[3rem] overflow-hidden mb-32 min-h-[80vh] flex items-center justify-center border border-slate-800 shadow-2xl">
            {/* Image Background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/hero-image.jpeg" 
              alt="Hero Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            
            {/* Gradient Overlays for depth and readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/30 via-transparent to-[#020817]/90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20 mix-blend-overlay"></div>
            
            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-8"
            >

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
                See Your Project Through an <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">Interviewer&apos;s Eyes</span>
              </h1>
              
              <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
                ProjectLens uses AI to analyze your GitHub projects, evaluate technical depth, and provide recruiter-style feedback to help you build interview-ready portfolios.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Link 
                  href="/signin" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center justify-center transform hover:-translate-y-1"
                >
                  Analyze Project Now <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <div id="features" className=" scroll-mt-14">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to shine</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Stop guessing what recruiters want. Our AI analyzes your repository exactly how a Senior Engineer would.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Code className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base font-bold mb-2">Deep Code Analysis</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Evaluates architecture, code quality, and best practices beyond the README.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-purple-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-base font-bold mb-2">Resume Worthiness</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Generates ATS-friendly bullet points you can copy straight to your resume.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-base font-bold mb-2">Interview Prep</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Predicts exact questions an interviewer will ask about your implementation.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold mb-2">Technical Score</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  AI rates your project and suggests architectural improvements to boost your score.
                </p>
              </div>
            </div>
          </div>

          {/* How it Works Section */}
          <div id="how-it-works" className="py-20 scroll-mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">How it Works</h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">Three simple steps to get actionable, interview-ready feedback on your project.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
              <div className="flex-1 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold text-lg flex items-center justify-center mx-auto mb-3">1</div>
                <h3 className="font-bold text-white mb-1">Paste GitHub Repository</h3>
                <p className="text-slate-400 text-sm">Drop your GitHub repo URL into ProjectLens.</p>
              </div>
              <ArrowRight className="hidden md:block w-6 h-6 text-slate-600 flex-shrink-0" />
              <div className="flex-1 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 font-bold text-lg flex items-center justify-center mx-auto mb-3">2</div>
                <h3 className="font-bold text-white mb-1">AI Analyzes Project</h3>
                <p className="text-slate-400 text-sm">Our AI scans structure, code quality, and technical depth.</p>
              </div>
              <ArrowRight className="hidden md:block w-6 h-6 text-slate-600 flex-shrink-0" />
              <div className="flex-1 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 text-center">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 font-bold text-lg flex items-center justify-center mx-auto mb-3">3</div>
                <h3 className="font-bold text-white mb-1">Get Interview-Ready Feedback</h3>
                <p className="text-slate-400 text-sm">Receive scores, resume points, and interview questions instantly.</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div id="about" className="py-10 scroll-mt-24">
            <div className="max-w-3xl mx-auto text-center p-8 rounded-3xl bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-teal-900/20 border border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-5">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">About ProjectLens</h2>
              <p className="text-slate-300 text-base leading-relaxed mb-4">
                ProjectLens is an AI-powered evaluation platform built to bridge the gap between what developers build and what hiring teams actually look for. It helps students, developers, and job seekers understand their project&apos;s true market value — before walking into an interview room.
              </p>
              <p className="text-slate-400 text-sm">Built with Next.js · Node.js · OpenAI · MongoDB</p>
            </div>
          </div>

          {/* Contact Section */}
          <div id="contact" className="py-10 scroll-mt-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Contact</h2>
              <p className="text-slate-400 text-base mb-8 max-w-lg mx-auto">
                Whether you&apos;re a developer, recruiter, or student, ProjectLens is here to help you build stronger projects.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://github.com/Bhuvana-shri-19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 transition-all text-sm font-medium text-slate-300 hover:text-white"
                >
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  github.com/Bhuvana-shri-19
                </a>
                <a
                  href="mailto:bhuvanashri.ashok@gmail.com"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-sm font-medium text-slate-300 hover:text-white"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  bhuvanashri.ashok@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-[#020817] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-slate-300">ProjectLens</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ProjectLens. Empowering developers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
