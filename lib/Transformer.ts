import {
  addAmpBoilerplate,
  addAmpScript,
  addCharset,
  addViewport,
  replaceImg,
  keepWhitelistedTags,
  setAmpOnHtml,
} from './decorators'

import convertToDom from './convertToDom'
import strip from './strip'
import IDocument from './interfaces/IDocument'

export default class Transform {
  private html: string = ''
  private additionalDecorators: Function[] | undefined
  private additionalTags: string[] | undefined
  private document: IDocument = {
    jsdom: null,
    window: null,
    document: null,
  }

  constructor(
    additionalDecorators?: Function[],
    additionalTags?: string[]
  ) {
    this.additionalDecorators = additionalDecorators
    this.additionalTags = additionalTags
  }

  public async transform(
    html: string,
  ): Promise<string> {
    this.html = html

    this.document = await convertToDom(html)

    return await this.transformDocumentToAmp()
  }

  private async transformDocumentToAmp(): Promise<string> {
    let document: IDocument = this.document;

    const decorators = [

      // Set AMP attribute on HTML element
      setAmpOnHtml,

      // Strip scripts
      (document) => strip(document, 'script'),

      // Set charset
      addCharset,

      // Add Viewport
      addViewport,

      // Add AMP Boilerplate
      addAmpBoilerplate,

      // Add AMP script
      addAmpScript,

      // Replace <img> with <amp-img>
      replaceImg,

      // @TODO Include canonical link
      // @TODO Replace external stylesheets
      // @TODO Replace inline styles
      // @TODO Set width and height for images

      keepWhitelistedTags,
    ]

    // Apply decorators
    decorators.forEach(async (decorator: Function) => {
      document = await decorator(document)
    })

    // Additional decorators
    if (this.additionalDecorators && this.additionalDecorators.constructor === Array) {
      this.additionalDecorators.forEach(async (decorator: Function) => {
        document = await decorator(document)
      })
    }

    // Export full HTML
    return document.jsdom.serialize()
  }
}
