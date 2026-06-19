import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { auth, signOut } from '@/lib/auth/config';
import { LanguageToggle } from './language-toggle';
import { Button } from '@/components/ui/button';

export async function AppHeader() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'common' });
  const session = await auth();

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: `/${locale}/login` });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-primary">PromptFlow</span>
          </Link>
          {session?.user && (
            <nav className="hidden gap-4 md:flex">
              <Link
                href={`/${locale}/projects`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('projects')}
              </Link>
              <Link
                href={`/${locale}/generate`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('newProject')}
              </Link>
              <Link
                href={`/${locale}/settings`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('settings')}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('dashboard')}
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {session?.user ? (
            <form action={handleSignOut}>
              <Button type="submit" variant="ghost" size="sm">
                {t('logout')}
              </Button>
            </form>
          ) : (
            <Link href={`/${locale}/login`}>
              <Button variant="ghost" size="sm">
                {t('login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
