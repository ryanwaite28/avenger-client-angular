import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


/*
  Adding a property to all array objects
*/
Object.defineProperty(Array.prototype, 'last', {
  get() {
    return this.length > 0 ? this[this.length - 1] : undefined;
  }
});


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
