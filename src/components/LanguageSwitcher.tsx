
"use client";

import { useTranslation } from 'next-i18next';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Updated imports
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const currentPathname = usePathname();
  const currentSearchParams = useSearchParams();

  const changeLanguage = async (locale: string) => {
    // This is a simplified approach. Production apps might need more robust locale path handling.
    // It assumes that the currentPathname does not include the locale prefix.
    // For example, if current path is /dashboard and new locale is 'fr', it pushes to /fr/dashboard.
    // If your `next-i18next` setup uses middleware for locale detection and prefixing,
    // `i18n.changeLanguage(locale)` followed by `router.refresh()` might be another pattern.

    let newPath = `/${locale}${currentPathname}`;
    
    // If the currentPathname for some reason already started with the old language, strip it.
    // This is defensive coding; usePathname in App Router usually doesn't include the [locale] segment value.
    if (currentPathname.startsWith(`/${i18n.language}/`)) {
      newPath = `/${locale}${currentPathname.substring(i18n.language.length + 1)}`;
    } else if (currentPathname === `/${i18n.language}`) { // Handles case like /en -> /fr
      newPath = `/${locale}`;
    }
    
    const search = currentSearchParams.toString();
    router.push(`${newPath}${search ? `?${search}` : ''}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {i18n.language.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.languages.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => changeLanguage(locale)}
            disabled={i18n.language === locale}
          >
            {locale.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
