import { TopNav } from '../components/shell/TopNav'
import { useReveal } from '../lib/useReveal'
import { SiteFooter } from '../components/shell/SiteFooter'
import { ButtonLink, SparkIcon } from '../components/ui/Button'
import { NoteScrap } from '../components/ui/Torn'
import { Burst, HeartDoodle, Underline } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { motion } from 'framer-motion'
import { useScrollParallax } from '../lib/useParallax'
import './static.css'

export default function About() {
  const page = useReveal<HTMLDivElement>()
  const deco1Scroll = useScrollParallax(42)
  const deco3Scroll = useScrollParallax(-38)
  const scrapScroll = useScrollParallax(18)

  return (
    <div className="page st" ref={page}>
      <TopNav back={{ to: '/', label: 'Back to Home' }} />
      <main className="shell st-main">
        <header className="st-head">
          <p className="st-eyebrow">About<Burst className="st-eyebrow-burst" size={19} /></p>
          <h1 className="st-title">A card is a small thing.<br />Being <em>remembered</em> isn&rsquo;t.
            <Underline className="st-title-ul" width={210} />
          </h1>
          <p className="st-lede">
            Built by μlearn ASI for Teacher&rsquo;s Day — so a student can put a photo, their own handwriting and a
            private note into something a teacher can actually keep. <HeartDoodle size={15} className="st-inline-heart" />
          </p>
        </header>

        <div className="st-cols stagger">
          <section>
            <h2>Your card stays yours</h2>
            <p>There is no account and no upload. The photo you choose is resized in your browser and packed, together with your words, into the link itself. Nothing is stored on a server — if you don&rsquo;t send the link, nobody sees the card.</p>
          </section>
          <section>
            <h2>Made to be written on</h2>
            <p>Every card is a canvas, not a form. Tap any words on the card and type straight onto it, in the handwriting you choose. Drag the photo, spin a sticker, tear a piece of tape across the corner.</p>
          </section>
          <section>
            <h2>Front and inside</h2>
            <p>Like a real card, there are two sides. The front is what your teacher sees first. The inside opens with a proper flip and holds the note meant only for them.</p>
          </section>
          <section>
            <h2>Works everywhere</h2>
            <p>Phone or laptop, the whole thing works the same — the camera, the writing, the stickers, the flip. Print it at 5×7&Prime; if you would rather hand it over.</p>
          </section>
        </div>

        <motion.div style={{ y: scrapScroll }}>
          <NoteScrap className="st-scrap reveal" rotate={-1.5} clip>
            To every teacher who stayed<br />back after the bell — thank you. <HeartDoodle size={16} className="st-inline-heart" />
          </NoteScrap>
        </motion.div>

        <div className="st-cta">
          <ButtonLink to="/pick" variant="dark" size="lg" icon={<SparkIcon />}>Make a card</ButtonLink>
        </div>

        <motion.span style={{ y: deco1Scroll }} className="st-deco st-deco--1"><Decoration deco="star-silver" /></motion.span>
        <motion.span style={{ y: deco3Scroll }} className="st-deco st-deco--3"><Decoration deco="daisy" /></motion.span>
      </main>
      <SiteFooter />
    </div>
  )
}
