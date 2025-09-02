import React from "react";
import Head from "next/head";
import { signIn } from "next-auth/react";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { brandingConfig } from "../config/branding";


export default function SignInPage({ csrfToken }: { csrfToken?: string }) {
  return (
    <>
      <Head>
        <title>{`${brandingConfig.name} – Sign in`}</title>
        <meta name="description" content={`${brandingConfig.name} sign in`} />
      </Head>
      <div className="auth-page">
        <header className="auth-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden>
              {brandingConfig.name.charAt(0)}
            </span>
            <span className="brand-name">{brandingConfig.name}</span>
          </div>
          <ThemeSwitcher />
        </header>

        <main className="auth-main">
          <div className="signin-content">
          <section className="auth-card" aria-labelledby="signin-title">
            <h1 id="signin-title" className="auth-title">
              Welcome back
            </h1>
            <p className="auth-subtitle">{brandingConfig.tagline}</p>

            <div className="auth-actions">
              <button
                type="button"
                className="auth-btn btn-primary"
                onClick={() => signIn("github", { callbackUrl: "/" })}
              >
                <span className="btn-icon" aria-hidden>🐙</span>
                Continue with GitHub
              </button>
              <button
                type="button"
                className="auth-btn btn-outline"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <span className="btn-icon" aria-hidden>🔍</span>
                Continue with Google
              </button>

              {process.env.NODE_ENV !== 'production' && (
                <div className="dev-login">
                  <hr className="dev-sep" />
                  <div className="dev-grid">
                    <input id="dev-email" type="email" placeholder="Dev email" className="auth-btn text-left" />
                    <input id="dev-name" type="text" placeholder="Dev name (optional)" className="auth-btn text-left" />
                    <button
                      type="button"
                      className="auth-btn"
                      onClick={() => {
                        const email = (document.getElementById('dev-email') as HTMLInputElement)?.value;
                        const name = (document.getElementById('dev-name') as HTMLInputElement)?.value;
                        if (!email) return alert('Enter an email');
                        signIn('credentials', { email, name, callbackUrl: '/' });
                      }}
                    >
                      <span className="btn-icon" aria-hidden>🧪</span>
                      Development Login
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="auth-hint">
              By continuing, you agree to our
              {" "}
              <a className="auth-link" href="/terms">Terms</a>
              {" "}and{ " "}
              <a className="auth-link" href="/privacy">Privacy</a>.
            </p>
          {/* Optional form-based sign-in matching DOM diff intent */}
          {csrfToken && (
            <form action="/api/auth/signin/github" method="POST" className="auth-footer" aria-label="GitHub sign-in form">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="callbackUrl" value="/" />
              <button type="submit" className="auth-btn btn-outline btn-inline">
                Continue with GitHub (Form)
              </button>
            </form>
          )}
          </section>
          </div>

          <footer className="auth-footer">
            <a className="auth-link" href={brandingConfig.githubUrl} target="_blank" rel="noreferrer noopener">
              GitHub
            </a>
            <a className="auth-link" href={brandingConfig.docsUrl} target="_blank" rel="noreferrer noopener">
              Docs
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
