import { reconcile } from "./reconcile";

export class Component {
  props;
  state;
  __internalInstance;
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    updateInstance(this.__internalInstance);
  }
}

export function createPublicInstance(element: IElement, internalInstance) {
  const { type, props } = element;
  const publicInstance = new (<any>type)(props);
  publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}

function updateInstance(internalInstance) {
  const parentDom = internalInstance.parentNode;
  const element = internalInstance.element;
  reconcile(parentDom, internalInstance, element);
}
