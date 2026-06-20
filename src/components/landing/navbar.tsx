'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { LogoPlaceholder } from '@/components/landing/logo-placeholder';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events';
import { SECTIONS } from '@/lib/landing/sections';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLanguage = () => {
    const next = locale === 'id' ? 'en' : 'id';
    trackEvent(ANALYTICS_EVENTS.LANGUAGE_TOGGLE);
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.replace(newPath);
  };

  const navLinks = SECTIONS.map((s) => ({
    href: `#${s.id}`,
    label: t(s.labelKey),
  }));

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-sm border-b border-border'
          : 'bg-background/60 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center">
          <LogoPlaceholder name="PromptFlow" />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={toggleLanguage}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {t('nav.languageToggle')}
          </button>
          <Link href={`/${locale}/register`}>
            <Button size="sm">{t('nav.cta')}</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t('nav.menuClose') : t('nav.menuOpen')}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
            className="border-b border-border bg-background/95 backdrop-blur-sm md:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileOpen(false);
                }}
                className="self-start rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
              >
                {t('nav.languageSwitchTo')}
              </button>
              <Link href={`/${locale}/register`} onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">
                  {t('nav.cta')}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
