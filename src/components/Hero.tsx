import { motion } from 'framer-motion';
import PhysicsStack from './PhysicsStack';

export default function Hero() {
  const line = {
    hidden: { y: '110%' },
    visible: (i: number) => ({
      y: 0,
      transition: { duration: 1, delay: i * 0.12, ease: [0.25, 0.1, 0, 1] },
    }),
  };

  return (
    <section className="min-h-screen flex flex-col justify-between px-6 md:px-12 pt-32 pb-8">
      <div className="max-w-[1400px] mx-auto w-full flex-1 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left — Name */}
        <div>
          <div className="mb-6">
            <div className="overflow-hidden">
              <motion.h1
                custom={0}
                initial="hidden"
                animate="visible"
                variants={line}
                className="font-serif text-[clamp(3.5rem,9vw,8rem)] font-light leading-[0.9] tracking-[-0.03em] text-ink"
              >
                Hi, I'm Xinyuan
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                custom={1}
                initial="hidden"
                animate="visible"
                variants={line}
                className="font-serif text-[clamp(3.5rem,9vw,8rem)] font-light leading-[0.9] tracking-[-0.03em] text-ink italic"
              >
                (Nate) Hu ...
              </motion.h1>
            </div>
          </div>
        </div>

        {/* Right — Physics playground */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="hidden lg:block h-[420px] relative"
        >
          <PhysicsStack />
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="max-w-[1400px] mx-auto w-full flex items-end justify-between pt-12 border-t border-warm-border"
      >
        <div className="flex items-center gap-8 text-ink-muted font-sans text-xs tracking-wider">
          <span>Atlanta, GA</span>
          <span>Emory '26</span>
          <span>Harvard '28</span>
        </div>

        <span className="font-sans text-xs tracking-wider text-ink-muted hidden sm:inline">
          natehu2003@gmail.com
        </span>
      </motion.div>
    </section>
  );
}
