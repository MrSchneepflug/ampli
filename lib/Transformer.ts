import {
  addAmpBoilerplate,
  addAmpScript,
  addCharset,
  addViewport,
  insertStyles,
  keepWhitelistedTags,
  removeBlacklistedAttributes,
  replaceElement,
  replaceImg,
  setAmpOnHtml,
} from './decorators'

import IDocument from './interfaces/IDocument'
import IOptions from './interfaces/IOptions'
import TransformerInterface from './interfaces/TransformerInterface'

import convertToDom from './convertToDom'
import strip from './strip'
import { walkTheTree } from './utis'

export default class Transformer implements TransformerInterface {
  public html = ''
  public document = {
    jsdom: null,
    window: null,
    document: null,
  }

  constructor(
    public options?: IOptions,
    public additionalDecorators?: Function[],
    public additionalTags?: string[]
  ) {}

  public async transform(
    html: string,
  ): Promise<string> {
    this.html = html

    this.document = await convertToDom(html)

    return await this.transformDocumentToAmp()
  }

  private async transformDocumentToAmp(): Promise<string> {
    let document: IDocument = this.document;

    // Order matters
    const decorators = [

      // Set AMP attribute on HTML element
      setAmpOnHtml,

      // Strip scripts
      (document: IDocument): IDocument => strip(document, 'script'),

      // Set charset
      addCharset,

      // Add Viewport
      addViewport,

      // Replace <img> with <amp-img>, set width and height for images
      replaceImg,

      // Replace <iframe> with <amp-iframe>
      (document: IDocument): Promise<IDocument> => (
        replaceElement(document, 'iframe', 'amp-iframe')
      ),

      // Keep only whitelisted tags and remove blacklisted attributes
      (context: IDocument): IDocument => {
        walkTheTree(context.document, (element: HTMLElement) => {
          keepWhitelistedTags(element)
          removeBlacklistedAttributes(element)
        })

        return context
      },

      // Replace external stylesheets, replace inline styles
      insertStyles,

      // Add AMP Boilerplate
      addAmpBoilerplate,

      // Add AMP script
      addAmpScript,


      // @TODO Include canonical link
    ]

    // Apply decorators
    for (const decorator of decorators) {
      document = await decorator(document)
    }

    // Additional decorators
    if (this.additionalDecorators && this.additionalDecorators.constructor === Array) {
      for (const decorator of this.additionalDecorators) {
        document = await decorator(document)
      }
    }

    // Export full HTML
    return document.jsdom.serialize()
  }
}
