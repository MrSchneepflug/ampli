import { JSDOM } from "jsdom";

import ContextInterface from "./interfaces/ContextInterface";

const convertToDom = (html: string): ContextInterface => {
  if (!html || html.length === 0) {
    throw new Error("HTML not set");
  }

  let jsdom: JSDOM = new JSDOM(html);

  if (jsdom.window.document.doctype === null) {
    html = `<!DOCTYPE html>${html}`;
    jsdom = new JSDOM(html);
  }

  return {
    document: jsdom.window.document,
    jsdom,
    window: jsdom.window,
  };
};

export default convertToDom;
