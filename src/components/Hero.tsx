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

// Exact HD Video from Pixabay (Rooster & Village Farm - 10685)
const HERO_ROOSTER_VIDEO = {
  id: 'rooster-village-farm-10685',
  title: 'Free-Range Heritage Rooster & Village Farm (HD)',
  localUrl: '/videos/hero-rooster.mp4',
  cdnUrl: 'https://cdn.pixabay.com/video/2017/07/16/10685-226624850_large.mp4',
  poster: '/videos/hero-rooster.jpg',
  fallbackPoster: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1920&q=80',
};

export const Hero: React.FC<HeroProps> = ({ onBuyNow, onExploreFarm, onViewCart }) => {
  const { scrollY } = useScroll();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Parallax Scroll Transforms
  const textY = useTransform(scrollY, [0, 600], [0, -80]);
  const textOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 800], [1, 1.08]);

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
      {/* Background HD Rooster Video Layer - Crisp, no sun blur/fog */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      >
        {/* Exact Pixabay 1080p HD Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          poster={HERO_ROOSTER_VIDEO.poster}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={HERO_ROOSTER_VIDEO.localUrl} type="video/mp4" />
          <source src={HERO_ROOSTER_VIDEO.cdnUrl} type="video/mp4" />
        </video>

        {/* Fallback image when video is loading */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            videoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ backgroundImage: `url(${HERO_ROOSTER_VIDEO.poster}), url(${HERO_ROOSTER_VIDEO.fallbackPoster})` }}
        />

        {/* Crystal clear overlay for pristine HD video visibility while keeping text perfectly legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A12]/75 via-transparent to-black/25 pointer-events-none" />
      </motion.div>

      {/* Video Status Badge & Controls Bar (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-30 hidden sm:flex items-center gap-2.5 bg-[#0F2D1F]/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#52B788]/40 shadow-xl text-xs font-semibold text-[#FAF8F2]">
        <div className="flex items-center gap-1.5 text-[11px] text-[#52B788] font-bold px-1.5 py-0.5 rounded-full bg-[#52B788]/15 border border-[#52B788]/30">
          <Film className="w-3 h-3" />
          <span>1080p HD</span>
        </div>

        <div className="h-3 w-[1px] bg-white/20" />

        <button
          onClick={toggleVideoPlay}
          title={isPlaying ? 'Pause Rooster Video' : 'Play Rooster Video'}
          className="p-1 rounded-full hover:bg-white/15 text-[#FAF8F2] transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={toggleNatureAudio}
          title={isAudioActive ? 'Mute Farm Sound' : 'Play Nature Birds & Farm Sound'}
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
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F2D1F]/80 border border-[#D4A373]/50 text-[#D4A373] text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md mb-6 shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
          <span>100% NATURAL • SINGLE-ORIGIN HARVEST</span>
        </motion.div>

        {/* Main Headline: FROM OUR FARM TO YOUR HOME */}
        <div className="overflow-hidden mb-6">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-[#FAF8F2] drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
          >
            FROM OUR FARM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAF8F2] via-[#E9C46A] to-[#D4A373]">
              TO YOUR HOME
            </span>
          </motion.h1>
        </div>

        {/* Narrative Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl text-base sm:text-lg md:text-xl text-[#FAF8F2] leading-relaxed font-body mb-9 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        >
          Fresh, natural and pure farm products, nurtured on regenerative soil and delivered directly to your doorstep within hours of harvest.
        </motion.p>

        {/* Prominent Action Buttons: BUY NOW & EXPLORE */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-lg"
        >
          {/* Main "BUY NOW" Action Button */}
          <button
            id="hero-buy-now-btn"
            onClick={onBuyNow}
            className="w-full sm:w-auto px-9 py-4.5 rounded-full bg-gradient-to-r from-[#2D6A4F] via-[#40916C] to-[#52B788] text-[#FAF8F2] text-sm font-black tracking-widest uppercase shadow-[0_10px_30px_rgba(45,106,79,0.7)] hover:shadow-[0_15px_35px_rgba(82,183,136,0.85)] border border-[#74C69D]/60 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#FAF8F2]" />
            <span>BUY NOW • EXPLORE 50 PRODUCTS</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 text-[#FAF8F2]" />
          </button>

          {/* Secondary Farm Ethos CTA */}
          <button
            id="hero-explore-farm-btn"
            onClick={onExploreFarm}
            className="w-full sm:w-auto px-7 py-4.5 rounded-full bg-[#0F2D1F]/80 hover:bg-[#0F2D1F] text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase backdrop-blur-md border border-[#FAF8F2]/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <span>OUR SANCTUARY STORY</span>
          </button>
        </motion.div>

        {/* Quick Highlights Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-left border-t border-white/20 pt-7 w-full max-w-3xl"
        >
          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-base shadow-sm">
              🌱
            </div>
            <div>
              <p className="text-xs font-bold text-[#FAF8F2] uppercase tracking-wider">Zero Chemicals</p>
              <p className="text-[11px] text-[#FAF8F2]/80">Antibiotic & GMO Free</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#E9C46A] shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#E9C46A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FAF8F2] uppercase tracking-wider">Purity Tested</p>
              <p className="text-[11px] text-[#FAF8F2]/80">18+ Batch Purity Checks</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 col-span-2 md:col-span-1 bg-black/30 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#D4A373] shadow-sm">
              <Truck className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FAF8F2] uppercase tracking-wider">Morning Delivery</p>
              <p className="text-[11px] text-[#FAF8F2]/80">Plucked fresh daily</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Down Indicator */}
      <motion.button
        id="hero-scroll-indicator"
        onClick={onBuyNow}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll down to explore products"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-[#FAF8F2]/80 hover:text-[#FAF8F2] p-2 focus:outline-none flex flex-col items-center gap-1 text-[10px] uppercase font-bold tracking-widest drop-shadow"
      >
        <span>View Products</span>
        <ArrowDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
};

