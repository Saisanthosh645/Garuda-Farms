import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  ArrowDown, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ShoppingBag, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle2,
  Film
} from 'lucide-react';

interface HeroProps {
  onBuyNow: () => void;
  onExploreFarm: () => void;
  onViewCart?: () => void;
}

import { ClayPot3DCanvas } from './ClayPot3DCanvas';
import { MugguDivider, MugguFlower, ClayArtMotif } from './MugguCurves';

// Uploaded Farm Video Loop
const HERO_ORGANIC_VIDEO = {
  id: 'uploaded-farm-hero-video',
  title: 'Garuda Farms - Organic Farm Experience (1080p HD)',
  cdnUrl: '/videos/uploaded-hero-video.mp4',
  secondaryUrl: '/videos/hero-rooster.mp4',
  tertiaryUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sun-shining-through-green-leaves-42907-large.mp4',
  poster: '/assets/organic-farm-hero.png',
  fallbackPoster: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80',
};

export const Hero: React.FC<HeroProps> = ({ onBuyNow, onExploreFarm, onViewCart }) => {
  const { scrollY } = useScroll();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect mobile once — used to skip video download and heavy parallax
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipHeavyEffects = isMobile || prefersReducedMotion;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Parallax Scroll Transforms — static on mobile to avoid continuous RAF work
  const textY = useTransform(scrollY, [0, 600], skipHeavyEffects ? [0, 0] : [0, -80]);
  const textOpacity = useTransform(scrollY, [0, 450], skipHeavyEffects ? [1, 1] : [1, 0]);
  const bgScale = useTransform(scrollY, [0, 800], skipHeavyEffects ? [1, 1] : [1, 1.08]);

  // Gentle procedural nature synthesizer (birds and gentle morning breeze)
  const audioContextRef = useRef<AudioContext | null>(null);
  const birdTimerRef = useRef<number | null>(null);

  const toggleNatureAudio = () => {
    if (isAudioActive) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (birdTimerRef.current) {
        clearInterval(birdTimerRef.current);
      }
      setIsAudioActive(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Gentle wind brown noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 0.08; // subtle ambient breeze
        }

        const windSource = ctx.createBufferSource();
        windSource.buffer = buffer;
        windSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

        windSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        windSource.start();

        // Occasional morning bird chirp generator
        const playChirp = () => {
          if (!audioContextRef.current) return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();

          osc.type = 'sine';
          const baseFreq = 2200 + Math.random() * 800;
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 900, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(baseFreq - 400, now + 0.18);

          chirpGain.gain.setValueAtTime(0, now);
          chirpGain.gain.linearRampToValueAtTime(0.04, now + 0.03);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

          osc.connect(chirpGain);
          chirpGain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.22);
        };

        birdTimerRef.current = window.setInterval(() => {
          if (Math.random() > 0.4) playChirp();
        }, 3200);

        setIsAudioActive(true);
      } catch (e) {
        console.error('Audio synthesizer not allowed:', e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (birdTimerRef.current) {
        clearInterval(birdTimerRef.current);
      }
    };
  }, []);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#0A1A12] text-[#FAF8F2] select-none"
    >
      {/* Organic floating blob decorators (behind video) */}
      <div className="absolute top-[-10%] right-[-8%] w-[520px] h-[520px] bg-[#1B4332]/40 rounded-[60%_40%_55%_45%/45%_60%_40%_55%] blur-[90px] pointer-events-none z-[1] animate-blob-drift" />
      <div className="absolute bottom-[-5%] left-[-6%] w-[380px] h-[380px] bg-[#C8A882]/15 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] blur-[70px] pointer-events-none z-[1]" style={{ animationDelay: '4s' }} />

      {/* Background HD Rooster Video Layer */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      >
        {/* On mobile: show only the poster image — no video download */}
        {skipHeavyEffects ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_ORGANIC_VIDEO.poster}), url(${HERO_ORGANIC_VIDEO.fallbackPoster})` }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onLoadedData={() => setVideoLoaded(true)}
            poster={HERO_ORGANIC_VIDEO.poster}
            className="w-full h-full object-cover"
          >
            <source src={HERO_ORGANIC_VIDEO.cdnUrl} type="video/mp4" />
            <source src={HERO_ORGANIC_VIDEO.secondaryUrl} type="video/mp4" />
            <source src={HERO_ORGANIC_VIDEO.tertiaryUrl} type="video/mp4" />
          </video>
        )}

        {/* Fallback when video is loading — only relevant on desktop */}
        {!skipHeavyEffects && (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ backgroundImage: `url(${HERO_ORGANIC_VIDEO.poster}), url(${HERO_ORGANIC_VIDEO.fallbackPoster})` }}
          />
        )}

        {/* Rich organic gradient overlay: deep forest bottom, earthy mid, crystal top */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060F09]/85 via-[#0A1A12]/30 to-black/20 pointer-events-none" />
        {/* Warm amber vignette on sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A12]/40 via-transparent to-[#0A1A12]/30 pointer-events-none" />
      </motion.div>

      {/* Video Controls Bar (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-30 hidden sm:flex items-center gap-2.5 bg-[#0F2D1F]/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#52B788]/40 shadow-xl text-xs font-semibold text-[#FAF8F2]">
        <div className="flex items-center gap-1.5 text-[11px] text-[#52B788] font-bold px-1.5 py-0.5 rounded-full bg-[#52B788]/15 border border-[#52B788]/30">
          <Film className="w-3 h-3" />
          <span>1080p HD</span>
        </div>
        <div className="h-3 w-[1px] bg-white/20" />
        <button
          onClick={toggleVideoPlay}
          title={isPlaying ? 'Pause' : 'Play'}
          className="p-1 rounded-full hover:bg-white/15 text-[#FAF8F2] transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={toggleNatureAudio}
          title={isAudioActive ? 'Mute Farm Sound' : 'Play Nature Sound'}
          className={`p-1 rounded-full transition-colors ${
            isAudioActive ? 'bg-[#52B788] text-[#0F2D1F]' : 'hover:bg-white/15 text-[#FAF8F2]'
          }`}
        >
          {isAudioActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Foreground Content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-28 pb-16 flex flex-col items-center"
      >
        {/* Organic Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 mb-7 shadow-[0_4px_20px_rgba(212,163,115,0.25)]"
          style={{
            background: 'linear-gradient(135deg, rgba(15,45,31,0.9) 0%, rgba(27,67,50,0.85) 100%)',
            border: '1px solid rgba(212,163,115,0.4)',
            borderRadius: '50px 50px 50px 50px / 50px 50px 50px 50px',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Organic leaf icon */}
          <span className="text-sm leading-none">🌿</span>
          <span className="text-[#D4A373] text-[11px] font-black tracking-[0.22em] uppercase">
            100% NATURAL • SINGLE-ORIGIN HARVEST
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#E9C46A] animate-pulse-subtle" />
        </motion.div>

        {/* Main Headline — Organic cinematic style */}
        <div className="overflow-hidden mb-5">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-[#FAF8F2] drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          >
            FROM OUR FARM <br />
            <span
              className="font-display italic"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FAF8F2 0%, #E9C46A 40%, #D4A373 70%, #C8A882 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              to your Home
            </span>
          </motion.h1>
        </div>

        {/* Organic tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
          className="max-w-2xl text-base sm:text-lg md:text-xl text-[#FAF8F2]/90 leading-relaxed font-body mb-6 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        >
          Fresh, natural and pure farm products, nurtured on regenerative soil and delivered{' '}
          <span className="text-[#D4A373] font-semibold">directly to your doorstep</span> within hours of harvest.
        </motion.p>

        {/* Traditional Indian Muggu Rice-Powder Divider */}
        <MugguDivider color="#E9C46A" className="my-3 opacity-90 max-w-xl" />

        {/* Action Buttons — Organic warm style */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.58 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-lg mb-12"
        >
          {/* Primary CTA */}
          <button
            id="hero-buy-now-btn"
            onClick={onBuyNow}
            className="w-full sm:w-auto px-8 py-4 rounded-full text-[#FAF8F2] text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 45%, #40916C 100%)',
              boxShadow: '0 12px 32px rgba(45,106,79,0.65), 0 4px 12px rgba(45,106,79,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              border: '1px solid rgba(116,198,157,0.5)',
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>BUY NOW • EXPLORE 50 PRODUCTS</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </button>

          {/* Secondary CTA */}
          <button
            id="hero-explore-farm-btn"
            onClick={onExploreFarm}
            className="w-full sm:w-auto px-7 py-4 rounded-full text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(15,45,31,0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(200,168,130,0.35)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <span>🌾</span>
            <span>OUR SANCTUARY STORY</span>
          </button>
        </motion.div>

        {/* Organic Trust Highlights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.78 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-left border-t border-white/15 pt-7 w-full max-w-3xl"
        >
          {[
            { icon: '🌱', title: 'Zero Chemicals', sub: 'Antibiotic & GMO Free' },
            { icon: '🛡️', title: 'Purity Tested', sub: '18+ Batch Checks', small: true },
            { icon: '🚚', title: 'Morning Delivery', sub: 'Plucked fresh daily', hideMobile: true },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -2 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${item.hideMobile ? 'hidden md:flex col-span-2 md:col-span-1' : ''}`}
              style={{
                background: 'rgba(0,0,0,0.28)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ background: 'rgba(45,106,79,0.7)', border: '1px solid rgba(82,183,136,0.3)' }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-[#FAF8F2] uppercase tracking-wider">{item.title}</p>
                <p className="text-[10px] text-[#FAF8F2]/75">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Organic scroll indicator */}
      <motion.button
        id="hero-scroll-indicator"
        onClick={onBuyNow}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll down to explore products"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-[#FAF8F2]/75 hover:text-[#FAF8F2] p-2 focus:outline-none flex flex-col items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors"
      >
        <span className="text-[#C8A882]">View Products</span>
        <ArrowDown className="w-4 h-4 text-[#C8A882]" />
      </motion.button>
    </section>
  );
};

