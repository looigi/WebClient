import { AntsWebV2Page } from './app.po';

describe('ants-web-v2 App', () => {
  let page: AntsWebV2Page;

  beforeEach(() => {
    page = new AntsWebV2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
