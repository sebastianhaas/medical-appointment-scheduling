/*
 * Angular bootstraping
 */
import { platformBrowserDynamic }  from '@angular/platform-browser-dynamic';
import { decorateModuleRef }       from './app/environment';
import { bootloader }              from '@angularclass/hmr';
import { getTranslationProviders } from './app/i18n-providers';
/*
 * App Module
 * our top level module that holds all of our components
 */
import { AppModule }               from './app/app.module';

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main(): Promise<any> {
  // Get translation provider
  return getTranslationProviders().then(
    (providers) => {
      const options = { providers };

      return platformBrowserDynamic()
        .bootstrapModule(AppModule, options)
        .then(decorateModuleRef)
        .catch((err) => console.error(err));
    }
  );
}

// needed for hmr
// in prod this is replace for document ready
bootloader(main);
