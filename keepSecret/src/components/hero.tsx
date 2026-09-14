import React, { useState } from 'react';
import { MessageSquare, Video, Shield, Sparkles, Users, ArrowRight } from 'lucide-react';

export const StrangerChatHero: React.FC = () => {
  const [chatType, setChatType] = useState<'video' | 'text'>('video');

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex flex-col justify-between">
      {/* Background Glows using custom colors */}
      <div 
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'oklch(82.8% 0.189 84.429)' }}
      />
      <div 
        className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] rounded-full opacity-30 blur-[140px] pointer-events-none"
        style={{ backgroundColor: '#7b3306' }}
      />

      
       

      {/* Main Hero Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        {/* Live Counter Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 backdrop-blur-md mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-neutral-300">
            <strong className="text-white">42,891</strong> Strangers Online Now
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Meet new people with{' '}
          <span 
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, oklch(82.8% 0.189 84.429), #7b3306)`
            }}
          >
            zero strings attached.
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed">
          Instantly connect with random strangers worldwide. Safe, anonymous, and completely free text & video chat.
        </p>

        {/* Chat Call-to-Action Card */}
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 p-3 rounded-3xl backdrop-blur-xl shadow-2xl">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-2xl mb-3">
            <button
              onClick={() => setChatType('video')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                chatType === 'video'
                  ? 'bg-neutral-800 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              Video Chat
            </button>
            <button
              onClick={() => setChatType('text')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                chatType === 'text'
                  ? 'bg-neutral-800 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Text Chat
            </button>
          </div>

          {/* Start Button */}
          <button
            className="w-full py-4 rounded-2xl font-bold text-lg text-neutral-950 flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg hover:brightness-110"
            style={{ backgroundColor: 'oklch(82.8% 0.189 84.429)' }}
          >
            <span>Start {chatType === 'video' ? 'Video' : 'Text'} Call</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Trust Indicators */}
        
      </main>

      
    </div>
  );
};

export default StrangerChatHero;