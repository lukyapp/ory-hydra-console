export class UrlHelper {
  static joinUrl(base: string, path: string) {
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }

  static toUrl(url: string) {
    return new URL(url);
  }
}
