import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LogoPlaceholder } from '@/components/landing/logo-placeholder';
import { ExternalLink } from 'lucide-react';

const TWITTER_URL = 'https://twitter.com/promptflow';
const GITHUB_URL = 'https://github.com/promptflow';

export async function Footer() {
  const t = await getTranslations('landing.footer');

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <LogoPlaceholder name="PromptFlow" />
            <p className="mt-3 text-sm text-muted-foreground">{t('tagline')}</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              {t('productLinks.features')}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('productLinks.features')}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('productLinks.howItWorks')}
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('productLinks.faq')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              {t('legalLinks.privacy')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('legalLinks.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('legalLinks.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              {t('social.twitter')}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('social.twitter')}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('social.github')}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
