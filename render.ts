import { reconcile } from "./reconcile";
import { TEXT_ELEMENT } from "./constant";

let rootInstance = null;

export const render = (element, container: HTMLElement) => {
  rootInstance = reconcile(container, rootInstance, element);
};

export function createElement(type, config: object, ...args): IElement {
  const props = { ...config };

  props[`children`] = args.reduce((acc, x) => acc.concat(x), [])
    .filter(x => x !== null && x !== false)
    .map(x => (x instanceof Object ? x : createTextElement(x)));

  return { type, props };
}

const createTextElement = (value: string) =>
  createElement(TEXT_ELEMENT, { nodeValue: value });
