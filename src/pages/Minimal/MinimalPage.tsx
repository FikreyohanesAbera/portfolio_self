import React from "react"
import { useEffect } from "react"
import styles from "./MinimalPage.module.css"
import { portfolio } from "../../content/portfolio"
import ChangeModeLink from "../../components/ChangeModeLink"
import { applySeo } from "../../app/seo"
import { writeMode } from "../../app/mode"

export default function MinimalPage() {
  useEffect(() => {
    writeMode("minimal")
    applySeo({
      title: `${portfolio.name} · Minimal portfolio`,
      description: portfolio.pitch,
      ogImage: "/og-minimal.png"
    })
  }, [])

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.dot} aria-hidden="true" />
          <div className={styles.brandText}>Minimal portfolio</div>
        </div>
        <ChangeModeLink />
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroGrid}>
          <div>
            <h1 id="hero-title" className={styles.h1}>
              {portfolio.name}
            </h1>
            <p className={styles.headline}>{portfolio.headline}</p>
            <p className={styles.pitch}>{portfolio.pitch}</p>

            <div className={styles.actions} aria-label="Primary actions">
              {portfolio.actions.map((a) => (
                <a
                  key={a.label}
                  className={styles.action}
                  href={a.href}
                  target={a.href.startsWith("http") ? "_blank" : undefined}
                  rel={a.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {a.label}
                </a>
              ))}
            </div>
          </div>

          <aside className={styles.summary} aria-label="Quick summary">
            <div className={styles.summaryTitle}>Highlights</div>
            <ul className={styles.summaryList}>
              <li>Accessibility-first, performance-aware front end engineering</li>
              <li>Systems thinking with practical observability and reliability habits</li>
              <li>Creative interaction design that stays usable and skimmable</li>
            </ul>
          </aside>
        </div>
      </section>

      <nav className={styles.nav} aria-label="Page sections">
        <a href="#education">Education</a>
        <a href="#experience">Work experience</a>
        <a href="#projects">Projects</a>
        <a href="#tools">Tools and frameworks</a>
      </nav>

      <section id="education" className={styles.section} aria-labelledby="education-title">
        <h2 id="education-title" className={styles.h2}>Education</h2>
        <div className={styles.cards}>
          {portfolio.education.map((e) => (
            <article key={e.degree} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardTitle}>{e.degree}</div>
                <div className={styles.cardMeta}>{e.dateRange}</div>
              </div>
              <div className={styles.cardMetaStrong}>{e.institution}</div>
              <ul className={styles.bullets}>
                {e.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className={styles.section} aria-labelledby="experience-title">
        <h2 id="experience-title" className={styles.h2}>Work experience</h2>
        <div className={styles.cards}>
          {portfolio.experience.map((x) => (
            <article key={`${x.role}-${x.company}`} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardTitle}>{x.role}</div>
                <div className={styles.cardMeta}>{x.dateRange}</div>
              </div>
              <div className={styles.cardMetaStrong}>{x.company}</div>
              <ul className={styles.bullets}>
                {x.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className={styles.section} aria-labelledby="projects-title">
        <h2 id="projects-title" className={styles.h2}>Projects</h2>
        <div className={styles.cards}>
          {portfolio.projects.map((p) => (
            <article key={p.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardTitle}>{p.title}</div>
                <div className={styles.stack}>
                  {p.stack.map((s) => (
                    <span className={styles.pill} key={s}>{s}</span>
                  ))}
                </div>
              </div>

              <p className={styles.cardText}>{p.summary}</p>

              <div className={styles.links}>
                {p.links.map((l) => (
                  <a
                    key={l.href}
                    className={styles.link}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {l.label}
                  </a>
                ))}
              </div>

              <details className={styles.details}>
                <summary className={styles.summaryRow}>
                  Case study details
                </summary>
                <div className={styles.caseStudy}>
                  <div className={styles.caseBlock}>
                    <div className={styles.caseTitle}>Problem</div>
                    <p className={styles.caseText}>{p.caseStudy.problem}</p>
                  </div>

                  <div className={styles.caseBlock}>
                    <div className={styles.caseTitle}>Approach</div>
                    <ul className={styles.bullets}>
                      {p.caseStudy.approach.map((a) => <li key={a}>{a}</li>)}
                    </ul>
                  </div>

                  <div className={styles.caseBlock}>
                    <div className={styles.caseTitle}>Impact</div>
                    <ul className={styles.bullets}>
                      {p.caseStudy.impact.map((i) => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>

      <section id="tools" className={styles.section} aria-labelledby="tools-title">
        <h2 id="tools-title" className={styles.h2}>Tools and frameworks</h2>
        <div className={styles.toolGrid}>
          {portfolio.tools.map((g) => (
            <article key={g.label} className={styles.toolCard}>
              <div className={styles.toolTitle}>{g.label}</div>
              <div className={styles.toolItems}>
                {g.items.map((i) => (
                  <span className={styles.pill} key={i}>{i}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerText}>
            Want the guided experience? Try the immersive mode.
          </span>
          <a className={styles.footerCta} href="/immersive">
            Go to immersive mode
          </a>
        </div>
      </footer>
    </main>
  )
}
