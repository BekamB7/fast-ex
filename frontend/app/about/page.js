import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";

const principles = [
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Keep assessments organized with unique access codes and a focused exam experience.",
  },
  {
    icon: Clock3,
    title: "Less time on grading",
    description:
      "Review submissions and results in one place, with objective questions graded automatically.",
  },
  {
    icon: Users,
    title: "Built for organizations",
    description:
      "Give learners a dedicated exam portal that feels clear, familiar, and easy to use.",
  },
];

export const metadata = {
  title: "About Fast-Ex",
  description:
    "Learn about Fast-Ex, a thoughtful platform for creating, delivering, and reviewing online exams.",
};

export default function About() {
  return (
    <div className="container about-page py-8 md:py-16">
      <header className="about-hero">
        <p className="eyebrow">The Fast-Ex standard</p>
        <h1 className="gradient-text">Assessment, with clarity.</h1>
        <p>
          Fast-Ex helps organizations create, deliver, and review online exams
          in one thoughtful workspace, while giving learners a focused place to
          take them.
        </p>
      </header>

      <section className="about-mission" aria-labelledby="about-mission-title">
        <div className="about-mission-icon" aria-hidden="true">
          <GraduationCap />
        </div>
        <div>
          <p className="section-label">Our mission</p>
          <h2 id="about-mission-title">Make testing feel human.</h2>
          <p>
            Online assessment should be straightforward for the people who
            organize it and clear for the people who take it. We bring the
            essential exam workflow together so teams can focus on learning,
            not busywork.
          </p>
        </div>
      </section>

      <section className="about-principles" aria-labelledby="about-principles-title">
        <div className="about-section-heading">
          <p className="section-label">What matters to us</p>
          <h2 id="about-principles-title">A calmer way to run exams.</h2>
        </div>
        <div className="about-principle-grid">
          {principles.map(({ icon: Icon, title, description }) => (
            <article className="about-principle-card" key={title}>
              <span className="about-principle-icon">
                <Icon aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta" aria-labelledby="about-cta-title">
        <div>
          <p className="section-label">Ready when you are</p>
          <h2 id="about-cta-title">Bring your next exam into focus.</h2>
        </div>
        <Link href="/get-going" className="landing-button landing-button-primary">
          Get started <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </div>
  );
}
