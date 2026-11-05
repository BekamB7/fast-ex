import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "Page not found | Fast-Ex",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <p className="not-found-code">404 · PAGE NOT FOUND</p>
          <h1 id="not-found-title">
            Looks like this page took a wrong turn.
          </h1>
          <p className="not-found-description">
            The page may have moved, or the link might be out of date. Let’s
            get you back to a place that works.
          </p>
          <div className="not-found-actions">
            <Link href="/" className="landing-button landing-button-primary">
              <Home aria-hidden="true" size={17} />
              Back to home
            </Link>
            <Link
              href="/get-going"
              className="landing-button landing-button-secondary"
            >
              Explore Fast-Ex
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>

        <div className="not-found-art">
          <Image
            src="/images/download.gif"
            alt="Animated illustration for the Fast-Ex page not found screen"
            width={800}
            height={450}
            unoptimized
            priority
          />
        </div>
      </section>
    </main>
  );
}
