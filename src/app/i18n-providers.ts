import { TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID } from '@angular/core';

import * as moment    from 'moment';

declare var navigator: any; // navigator.languages not available yet

export function getTranslationProviders(): Promise<Object[]> {

  // Make sure a locale exists
  ensureLocale();

  // Get the locale id from localStorage
  const locale = localStorage.getItem('locale');

  // return no providers if fail to get translation file for locale
  const noProviders: Object[] = [];

  // No locale or U.S. English: no translation providers
  if (!locale || locale === 'en-US') {
    return Promise.resolve(noProviders);
  }

  if (locale.startsWith('de')) {
    let translationFileContents = require('raw-loader!../../locale/messages.de.xtb');
    return Promise.resolve([
        { provide: TRANSLATIONS, useValue: translationFileContents },
        { provide: TRANSLATIONS_FORMAT, useValue: 'xtb' },
        { provide: LOCALE_ID, useValue: locale }
      ]);
  } else {
    return Promise.resolve(noProviders);
  }
}

declare var System: any;

function getTranslationsWithSystemJs(file: string) {
  return System.import(file + '!text'); // relies on text plugin
}

/**
 * This sets the locale depending on the browser configuration.
 * The value is extracted from either `navigator.languages[0]`,
 * `navigator.language` or `navigator.userLanguage` and persisted to
 * localStorage, where all other parts of the application take it from.
 */
function ensureLocale() {
  if (!localStorage.getItem('locale')) {
    let locale = navigator.languages
      ? navigator.languages[0]
      : (navigator.language || navigator.userLanguage);
    localStorage.setItem('locale', locale);
    setMomentLocale(locale);
  } else {
    setMomentLocale(localStorage.getItem('locale'));
  }
}

/**
 * This sets the locale for all newly create moments globally.
 */
function setMomentLocale(locale: string) {
  moment.locale(locale);
}
