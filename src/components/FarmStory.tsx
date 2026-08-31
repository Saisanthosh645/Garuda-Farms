import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { STORY_STAGES } from '../data/farmData';

export const FarmStory: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage = STORY_STAGES[activeStageIndex];

  return (
    <section
      id="farm-story"
      className="relative py-28 sm:py-36 bg-[#0F2D1F] text-[#FAF8F2] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#2D6A4F]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#D4A373]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B4332] border border-[#D4A373]/30 text-[#D4A373] text-xs font-bold tracking-[0.2em] uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
            OUR SACRED PROCESS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FAF8F2]"
          >
            IT STARTS WITH THE FARM.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-base sm:text-lg text-[#FAF8F2]/80 font-normal max-w-2xl mx-auto"
          >
            Trace the uninterrupted path of nourishment. From ancient heirloom seeds to your morning breakfast table.
          </motion.p>
        </div>

        {/* Stage Selection Tabs */}
        <div className="flex justify-center mb-12 sm:mb-16 overflow-x-auto pb-4 no-scrollbar">
          <div className="inline-flex p-1.5 rounded-full bg-[#143D2B] border border-[#2D6A4F]/60 backdrop-blur-md">
            {STORY_STAGES.map((stage, idx) => {
              const isActive = activeStageIndex === idx;
              return (
                <button
                  key={stage.id}
                  id={`stage-tab-${stage.id}`}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`relative px-5 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap ${
                    isActive
                      ? 'text-[#0F2D1F] shadow-lg'
                      : 'text-[#FAF8F2]/70 hover:text-[#FAF8F2] hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-stage-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-[#D4A373] to-[#E9C46A] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 opacity-70">{stage.stageNumber}</span>
                  <span className="relative z-10">{stage.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Story Stage Showcase Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#143D2B]/90 rounded-3xl p-6 sm:p-10 lg:p-14 border border-[#2D6A4F]/50 shadow-2xl backdrop-blur-xl"
            >
              {/* Left Content Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#D4A373]">
                  <span>STAGE {activeStage.stageNumber}</span>
                  <span>•</span>
                  <span>{activeStage.tagline}</span>
                </div>

                <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#FAF8F2] leading-tight">
                  {activeStage.subtitle}
                </h3>

                <p className="text-[#FAF8F2]/85 text-base sm:text-lg leading-relaxed font-body">
                  {activeStage.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  {activeStage.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[#FAF8F2]/90">
                      <CheckCircle2 className="w-5 h-5 text-[#52B788] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Quote Box */}
                <div className="p-4 rounded-xl bg-[#0F2D1F]/70 border-l-4 border-[#D4A373] text-sm italic text-[#D4A373] font-serif">
                  {activeStage.quote}
                </div>

                {/* Next Step Action Button */}
                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={() =>
                      setActiveStageIndex((prev) => (prev + 1) % STORY_STAGES.length)
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2D6A4F] hover:bg-[#52B788] text-[#FAF8F2] text-xs font-bold tracking-widest uppercase transition-colors"
                  >
                    <span>
                      {activeStageIndex === STORY_STAGES.length - 1
                        ? 'Restart Journey'
                        : 'Next Stage'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Media Column */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] group">
                  <img
                    src={activeStage.image}
                    alt={activeStage.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D1F]/90 via-transparent to-black/20" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <span className="text-4xl font-heading font-black text-[#FAF8F2]/40 block leading-none">
                        {activeStage.stageNumber}
                      </span>
                      <span className="font-heading text-lg font-bold text-[#FAF8F2] tracking-wider uppercase">
                        {activeStage.title}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-black/40 text-[11px] text-[#D4A373] backdrop-blur-md border border-white/10">
                      Garuda Standard
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
