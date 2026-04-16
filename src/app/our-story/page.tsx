import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Our Story | Just The Tip Cigars',
  description: 'A veteran, a passion for cigars, and a gap in the community. Here\'s how Just The Tip Cigars went from an idea to South Park\'s favorite gathering place.',
};

export default function OurStoryPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* Header */}
        <div style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              The American Dream
            </div>
            <h1
              className="display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1 }}
            >
              Our Story
            </h1>
          </div>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto px-6 py-16">

          {/* Opening quote */}
          <div
            style={{
              borderLeft: '3px solid var(--color-terracotta)',
              paddingLeft: '1.5rem',
              marginBottom: '3rem',
              color: 'var(--color-smoke)',
              fontSize: '1rem',
              lineHeight: 1.8,
              fontStyle: 'italic',
            }}
          >
            In 1931, at the height of the Great Depression, James Truslow Adams wrote that
            the American Dream is the belief that life could be better, richer, and fuller
            for everyone — with the will, the opportunity, and the ability to make it so.
          </div>

          {/* Body paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            <p style={bodyStyle}>
              I&apos;ve proudly served my country in the United States Air Force, both stateside
              and overseas in Afghanistan during Operation Iraqi Freedom/Operation Enduring
              Freedom. I came home carrying that belief. Now it was time to live it.
            </p>

            <p style={bodyStyle}>
              For the better part of my civilian life, I worked for others. I paid the bills,
              kept a roof over our heads, and put food on the table — but that&apos;s all it ever
              was. Surviving. Every night I laid my head on the pillow unsatisfied, quietly
              dreaming of something more for my family and I.
            </p>

            <p style={bodyStyle}>
              I&apos;d come home to my beautiful, supportive wife and our 4-year-old triplets and
              wear a smile that wasn&apos;t genuine. I was going through the motions, and the
              people who deserved my best were getting what was left.
            </p>

            {/* Standalone line */}
            <p style={{ ...bodyStyle, fontWeight: 600, color: 'var(--color-cream)' }}>
              My wife had had enough.
            </p>

            {/* Fire scene */}
            <div
              style={{
                background: 'var(--color-charcoal)',
                border: '1px solid var(--color-charcoal-mid)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <p style={bodyStyle}>
                One crisp evening, sitting around the fire, she looked at me and said it plain:
              </p>
              <blockquote style={quoteStyle}>
                &ldquo;That&apos;s it, put in your 2-weeks&apos; notice and go for your dream, open the damn cigar lounge like you&apos;ve been dreaming!!&rdquo;
              </blockquote>
              <p style={bodyStyle}>
                I&apos;m sure my face said everything I didn&apos;t. We have triplets. A house. Two cars.
                Bills on top of bills. Has she lost her mind?
              </p>
              <blockquote style={quoteStyle}>
                &ldquo;We&apos;ll make it work, we always do, we can&apos;t continue with you coming home miserable, the kids are starting to notice.&rdquo;
              </blockquote>
            </div>

            <p style={bodyStyle}>
              Within a month, the dream stopped being a dream.
            </p>

            <p style={bodyStyle}>
              I handed in my resignation — hesitantly, if I&apos;m being honest — and we became a
              single-income household overnight. It felt slightly insane. But with my family
              behind me, we built the plan.
            </p>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--color-charcoal-mid)', margin: '0.5rem 0' }} />

            <p style={bodyStyle}>
              Just The Tip Cigars is the greatest adventure of my professional life. This is
              my American Dream — my business, my lounge, my legacy. A place where family,
              friends, and fellow dreamers gather over a fine cigar, share laughs, make
              memories, and maybe find the courage to chase something of their own.
            </p>

            <p style={bodyStyle}>
              A place where you can learn about cigars. Where I can learn from you. Where the
              conversation is good and the smoke is better.
            </p>

            {/* Closing */}
            <p style={{
              ...bodyStyle,
              color: 'var(--color-cream)',
              fontWeight: 600,
              fontSize: '1.1rem',
              marginTop: '0.5rem',
            }}>
              This is my dream. Pull up a chair, have a stick with me. You&apos;re family now.
            </p>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

const bodyStyle: React.CSSProperties = {
  color: 'var(--color-smoke)',
  fontSize: '1rem',
  lineHeight: 1.9,
};

const quoteStyle: React.CSSProperties = {
  color: 'var(--color-cream)',
  fontSize: '1rem',
  lineHeight: 1.8,
  fontStyle: 'italic',
  paddingLeft: '1rem',
  borderLeft: '2px solid var(--color-terracotta)',
  margin: 0,
};
