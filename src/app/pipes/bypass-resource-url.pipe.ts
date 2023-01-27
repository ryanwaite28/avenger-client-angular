import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'bypassResourceUrl'
})
export class BypassResourceUrlPipe implements PipeTransform {

  constructor(
    public readonly sanitizer: DomSanitizer
  ) {}

  transform(value: string, ...args: unknown[]): unknown {
    const s = this.sanitizer.bypassSecurityTrustResourceUrl(value);
    console.log({ s });
    return s;
  }

}
