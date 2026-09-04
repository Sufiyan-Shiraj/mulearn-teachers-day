import { TopNav } from '../components/shell/TopNav'
import { useReveal } from '../lib/useReveal'
import { SiteFooter } from '../components/shell/SiteFooter'
import { ButtonLink, ChevronPill, SparkIcon } from '../components/ui/Button'
import { Burst, HeartDoodle, Underline } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { motion } from 'framer-motion'
import { useScrollParallax } from '../lib/useParallax'
import './static.css'

const STEPS = [
  { n: '1', t: 'Pick a card', d: 'Seven designs, all completely different — bold, floral, retro, quiet. Whichever one feels like you and your teacher.' },
  { n: '2', t: 'Add your photo', d: 'Upload one from your gallery, or open the camera right here and take a selfie together. It drops straight into the card.' },
  { n: '3', t: 'Write on the card', d: 'No forms. Tap the words on the card itself and type. Change the handwriting, the size, the colour. Add hearts, stars, tape and doodles.' },
  { n: '4', t: 'Turn it over', d: 'The inside is yours alone — a personal note only your teacher will read when the card flips open.' },
  { n: '5', t: 'Send the link', d: 'One link holds the whole card. Send it on WhatsApp, message it, or print it out. Your teacher just taps to open.' },
]

export default function HowItWorks() {
  const page = useReveal<HTMLDivElement>()
  const deco1Scroll = useScrollParallax(48)
  const deco2Scroll = useScrollParallax(-36)
  const deco3Scroll = useScrollParallax(58)

  return (
    <div className="page st" ref={page}>
      <TopNav back={{ to: '/', label: 'Back to Home' }} />
      <main className="shell st-main">
        <header className="st-head">
          <p className="st-eyebrow">How it works<Burst className="st-eyebrow-burst" size={19} /></p>
          <h1 className="st-title">Five small steps,<br />one card they&rsquo;ll <em>keep</em>
            <Underline className="st-title-ul" width={150} />
          </h1>
          <p className="st-lede">It takes about three minutes. No account, nothing uploaded to a server — the card lives inside the link you send. <HeartDoodle size={15} className="st-inline-heart" /></p>
        </header>

        <ol className="st-steps">
          {STEPS.map(s => (
            <li key={s.n} className="st-step reveal">
              <span className="st-step-n">{s.n}</span>
              <div>
                <h2>{s.t}</h2>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="st-cta">
          <ButtonLink to="/photo" variant="dark" size="lg" icon={<SparkIcon />}>Create a Card</ButtonLink>
          <ButtonLink to="/about" variant="outline" size="lg" trailing={<ChevronPill />}>About this project</ButtonLink>
        </div>

        <motion.span style={{ y: deco1Scroll }} className="st-deco st-deco--1"><Decoration deco="star-gold" /></motion.span>
        <motion.span style={{ y: deco2Scroll }} className="st-deco st-deco--2"><Decoration deco="daisy" /></motion.span>
        <motion.span style={{ y: deco3Scroll }} className="st-deco st-deco--3"><Decoration deco="heart-red" /></motion.span>
      </main>
      <SiteFooter />
    </div>
  )
}
