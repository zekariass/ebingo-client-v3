import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { nextI18NextConfig } from './next-i18next.config';

import commonEn from '@/lib/i18n/locales/en/common.json';
import adminEn from '@/lib/i18n/locales/en/admin.json';
import commonAm from '@/lib/i18n/locales/am/common.json';
import adminAm from '@/lib/i18n/locales/am/admin.json';
// ... repeat for other languages

const resources = {
  en: { common: commonEn, admin: adminEn },
  am: { common: commonAm, admin: adminAm },
  // add or, ti, so similarly
};

i18n.use(initReactI18next).init({
  ...nextI18NextConfig,
  resources,
  interpolation: { escapeValue: false },
});

export default i18n;
