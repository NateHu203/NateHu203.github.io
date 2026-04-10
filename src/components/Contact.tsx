import RevealText, { FadeIn } from './RevealText';
import { lazy, Suspense } from 'react';

const ParticleCloud = lazy(() => import('./ParticleCloud'));

const socials = [
  { label: 'GitHub', href: 'https://github.com/NateHu203' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/xinyuanhu03204/' },
  { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=v-W5zIYAAAAJ&hl=en' },
];

export default function Contact() {
  return (
    <section id="contact" className="py-32 md:py-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6 mb-20">
          <RevealText className="font-mono text-xs tracking-[0.25em] uppercase text-ink-muted">
            Contact
          </RevealText>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — text content */}
          <div>
            <RevealText
              as="h2"
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[1] tracking-tight text-ink mb-8"
            >
              Let's talk.
            </RevealText>

            <FadeIn delay={0.2}>
              <p className="font-sans text-lg text-ink-muted leading-relaxed mb-12 max-w-md">
                Seeking Summer 2025 opportunities in Data Science and LLM Engineering.
                Open to collaborations, research, and interesting conversations.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <a
                href="mailto:natehu2003@gmail.com"
                className="inline-block font-serif text-2xl md:text-3xl text-ink hover:text-rust transition-colors duration-400 hover-line"
                data-hover
              >
                natehu2003@gmail.com
              </a>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex items-center gap-8 mt-12">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-300 hover-line"
                    data-hover
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right — particle effect (native Three.js) */}
          <FadeIn delay={0.3} className="hidden lg:block">
            <div className="w-full aspect-square">
              <Suspense fallback={null}>
                <ParticleCloud />
              </Suspense>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[1400px] mx-auto mt-40 pt-8 border-t border-warm-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <span className="font-mono text-xs text-ink-faint">&copy; {new Date().getFullYear()} Xinyuan Hu</span>
        <span className="font-mono text-xs text-ink-faint">Designed & built with intention</span>
      </div>
    </section>
  );
}
