import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";
const Cookies = require('js-cookie');



const CSRF_COOKIE = `CSRF-TOKEN`;
const CSRF_HEADER = `X-CSRF-TOKEN`;



@Injectable()
export class CsrfInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const TOKEN = Cookies.get(CSRF_COOKIE) || Cookies.get(CSRF_COOKIE.toLowerCase());
    // console.log({ TOKEN });
    if (TOKEN) {
      req = req.clone({
        headers: req.headers.set(CSRF_HEADER, TOKEN)
      });
    }
    
    return next.handle(req);
  }
}