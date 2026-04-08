import RevealText, { FadeIn } from './RevealText';
import AsciiBear from './AsciiBear';

export default function About() {
  return (
    <section id="about" className="py-32 md:py-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-6 mb-20">
          <RevealText className="font-mono text-xs tracking-[0.25em] uppercase text-ink-muted">
            About
          </RevealText>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* ASCII Bear */}
          <FadeIn delay={0.1} className="lg:col-span-5">
            <AsciiBear />
          </FadeIn>

          {/* Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <RevealText
              as="h2"
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-ink mb-8"
              delay={0.15}
            >
              I study how machines reason — then make them do it better.
            </RevealText>

            <FadeIn delay={0.3}>
              <div className="space-y-5 text-ink-light font-sans text-base leading-[1.8] mb-10">
                <p>
                  I'm a senior at Emory University double majoring in Data Science
                  and Computer Science. At the Tsinghua University Future Intelligence Lab,
                  I research edge-cloud LLM collaboration — work that's cut reasoning time
                  by 66% and API costs by 83%, resulting in three published papers.
                </p>
                <p>
                  Outside the lab, I play piano, shoot hoops, and occasionally lose LP
                  in League of Legends.
                </p>
              </div>
            </FadeIn>

            {/* Education + Awards in a simple grid */}
            <FadeIn delay={0.4}>
              <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-warm-border">
                <div>
                  <p className="font-sans text-xs uppercase text-ink-muted mb-3">Education</p>
                  <p className="font-serif text-xl text-ink">Emory University</p>
                  <p className="font-sans text-sm text-ink-muted mt-1">B.S. Data Science & Computer Science</p>
                  <p className="font-sans text-sm text-ink-faint mt-0.5">Class of 2026</p>
                </div>
                <div>
                  <p className="font-sans text-xs uppercase text-ink-muted mb-3">Recognition</p>
                  <ul className="space-y-1.5">
                    <li className="font-sans text-sm text-ink-light">Dean's List, 2022–2024</li>
                    <li className="font-sans text-sm text-ink-light">DataFest 2025 Best Insight</li>
                    <li className="font-sans text-sm text-ink-light">3 Research Publications</li>
                  </ul>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
