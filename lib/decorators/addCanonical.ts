import ContextInterface from "../interfaces/ContextInterface";
import { createElement } from "../utils/";

export default async (
  canonical: string,
  context: ContextInterface,
): Promise<ContextInterface> => {
  const canonicalElement = await createElement(
    context,
    "link",
    (element: HTMLElement): HTMLElement => {
      element.setAttribute("rel", "canonical");
      element.setAttribute("href", canonical);

      return element;
    },
  );

  context.document.head.appendChild(canonicalElement);

  return context;
};
