"use client";

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
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
  const { pathname, asPath, query } = router;

  const changeLanguage = async (locale: string) => {
    await router.push({ pathname, query }, asPath, { locale });
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