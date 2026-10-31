"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "A more secure exam",
    description:
      "Keep assessments organized with unique access codes and a focused exam experience.",
  },
  {
    icon: Clock3,
    title: "Less time spent grading",
    description:
      "Review submissions and results in one place, with objective questions graded automatically.",
  },
  {
    icon: GraduationCap,
    title: "Made for every organization",
    description:
      "Give your learners a dedicated portal that feels clear, familiar, and easy to use.",
  },
];

export default function Home() {
  return (
    <div className="landing-page">
      <section className="landing-hero container">
        <div className="landing-copy">
          <p className="landing-kicker">
            <Sparkles aria-hidden="true" size={16} />
            A clearer way to assess learning
          </p>
          <h1 className="landing-title">
            Better exams start with a <span>better experience.</span>
          </h1>
          <p className="landing-summary">
            Create, deliver, and review online exams from one thoughtful
            workspace. Simple for organizations, focused for learners.
          </p>
          <div className="landing-actions">
            <Link href="/get-going" className="landing-button landing-button-primary">
              Get started
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link href="/about" className="landing-button landing-button-secondary">
              Explore Fast-Ex
            </Link>
          </div>
          <ul className="landing-trust-list" aria-label="Platform benefits">
            <li>
              <Check aria-hidden="true" size={16} />
              Straightforward setup
            </li>
            <li>
              <Check aria-hidden="true" size={16} />
              Clear results
            </li>
          </ul>
        </div>

        <div className="landing-visual">
          <div className="landing-visual-orb landing-visual-orb-top" />
          <div className="landing-visual-orb landing-visual-orb-bottom" />
          <div className="exam-preview">
            <div className="exam-preview-topbar">
              <div className="exam-preview-brand">
                <span className="exam-preview-mark">
                  <BookOpenCheck aria-hidden="true" size={17} />
                </span>
                <span>Exam workspace</span>
              </div>
              <span className="exam-preview-status">
                <span />
                Sample
              </span>
            </div>

            <div className="exam-preview-heading">
              <p className="exam-preview-eyebrow">YOUR NEXT ASSESSMENT</p>
              <h2>Mathematics</h2>
              <p>Term 2 · General assessment</p>
            </div>

            <div className="exam-preview-progress">
              <div className="exam-preview-progress-copy">
                <span>Exam setup</span>
                <strong>Ready to review</strong>
              </div>
              <div className="exam-preview-progress-track">
                <span />
              </div>
            </div>

            <div className="exam-preview-details">
              <div className="exam-preview-detail">
                <span className="exam-preview-detail-icon">
                  <BookOpenCheck aria-hidden="true" size={16} />
                </span>
                <span>
                  <strong>Questions</strong>
                  <small>Organized in one place</small>
                </span>
                <BadgeCheck aria-hidden="true" className="exam-preview-check" size={18} />
              </div>
              <div className="exam-preview-detail">
                <span className="exam-preview-detail-icon exam-preview-detail-icon-warm">
                  <Clock3 aria-hidden="true" size={16} />
                </span>
                <span>
                  <strong>Time & access</strong>
                  <small>Set the rules that work for you</small>
                </span>
                <BadgeCheck aria-hidden="true" className="exam-preview-check" size={18} />
              </div>
            </div>

            <div className="exam-preview-footer">
              <span>
                <ShieldCheck aria-hidden="true" size={15} />
                Built for focused assessment
              </span>
              <ArrowUpRight aria-hidden="true" size={17} />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-workflow container" aria-label="How it works">
        <div className="landing-workflow-intro">
          <span className="landing-section-label">One smooth workflow</span>
          <p>From first question to final result.</p>
        </div>
        <div className="landing-workflow-steps">
          <div>
            <span>01</span>
            <strong>Create</strong>
          </div>
          <div>
            <span>02</span>
            <strong>Deliver</strong>
          </div>
          <div>
            <span>03</span>
            <strong>Understand</strong>
          </div>
        </div>
      </section>

      <section className="landing-features container">
        <div className="landing-section-heading">
          <p className="landing-section-label">Everything in its place</p>
          <h2>Made to make exam day feel easier.</h2>
          <p>
            Thoughtful tools for the people who organize exams and the learners
            who take them.
          </p>
        </div>
        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="landing-feature-card" key={title}>
              <span className={`landing-feature-icon landing-feature-icon-${index + 1}`}>
                <Icon aria-hidden="true" size={22} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-bottom-cta container">
        <div>
          <p className="landing-section-label">Ready when you are</p>
          <h2>Bring your next exam into focus.</h2>
        </div>
        <Link href="/get-going" className="landing-button landing-button-light">
          Launch your portal
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </div>
  );
}
