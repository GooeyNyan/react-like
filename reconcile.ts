import { NEXT_SUCCESSOR, TEXT_ELEMENT } from "./constant";
import { createPublicInstance } from "./component";

export function reconcile(
  parentDom: HTMLElement,
  oldInstance: IInstance,
  newElement: IElement
) {
  return createNewDom
    .processAfter(removeDom)
    .processAfter(replaceDom)
    .processAfter(updateDom)
    .processAfter(updateComponent)
    .processAfter(fallbackOfChain)({
    parentDom,
    newElement,
    oldInstance
  });
}

function reconcileChildren(oldInstance: IInstance, newElement: IElement) {
  const { dom, childrenInstances: oldChildrenInstances } = oldInstance;
  const newChildElements: any[] = newElement.props[`children`];
  const newChildInstances = [];
  const count = Math.max(oldChildrenInstances.length, newChildElements.length);

  for (let i = 0; i < count; i++) {
    const oldChildInstance = oldChildrenInstances[i];
    const newChildElement = newChildElements[i];

    const newChildInstance = reconcile(
      <HTMLElement>dom,
      oldChildInstance,
      newChildElement
    );

    newChildInstances.push(newChildInstance);
  }

  return newChildInstances.filter(instance => instance !== null);
}

/*****************
 * HELPER FUNCTION
 *****************/

function createNewDom({
  parentDom,
  oldInstance,
  newElement
}: {
  parentDom: HTMLElement;
  oldInstance: IInstance;
  newElement: IElement;
}) {
  if (oldInstance === null) {
    const newInstance = instantiate(newElement);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else {
    return NEXT_SUCCESSOR;
  }
}

function removeDom({
  parentDom,
  oldInstance,
  newElement
}: {
  parentDom: HTMLElement;
  oldInstance: IInstance;
  newElement: IElement;
}) {
  if (newElement === null) {
    parentDom.removeChild(oldInstance.dom);
    return null;
  } else {
    return NEXT_SUCCESSOR;
  }
}

function replaceDom({
  parentDom,
  oldInstance,
  newElement
}: {
  parentDom: HTMLElement;
  oldInstance: IInstance;
  newElement: IElement;
}) {
  if (oldInstance.element.type !== newElement.type) {
    const newInstance = instantiate(newElement);
    parentDom.replaceChild(newInstance.dom, oldInstance.dom);
    return newInstance;
  } else {
    return NEXT_SUCCESSOR;
  }
}

function updateDom({
  oldInstance,
  newElement
}: {
  oldInstance: IInstance;
  newElement: IElement;
}) {
  if (typeof newElement.type === `string`) {
    updateDomProperties(
      oldInstance.dom,
      oldInstance.element.props,
      newElement.props
    );
    oldInstance.childrenInstances = reconcileChildren(oldInstance, newElement);
    oldInstance.element = newElement;
    return oldInstance;
  } else {
    return NEXT_SUCCESSOR;
  }
}

function updateComponent({
  parentDom,
  oldInstance: instance,
  newElement
}: {
  parentDom: HTMLElement;
  oldInstance: any;
  newElement: IElement;
}) {
  if (typeof newElement.type !== `string`) {
    instance.publicInstance.props = newElement.props;
    const oldChildElement = instance.publicInstance.render();
    const oldChildInstance = instance.childInstance;
    const childInstance = reconcile(
      parentDom,
      oldChildInstance,
      oldChildElement
    );
    instance.dom = childInstance.dom;
    instance.childInstance = childInstance;
    instance.element = newElement;
    return instance;
  } else {
    return NEXT_SUCCESSOR;
  }
}

function fallbackOfChain() {
  return new Error(`Can not find a successor to process the request.`);
}

function instantiate(element: IElement): IInstance {
  const { type, props } = element;

  return instantiateDom.processAfter(instantiateComponent)({
    type,
    props,
    element
  });
}

function instantiateDom({
  type,
  props,
  element
}: {
  type: string;
  props: object;
  element: IElement;
}) {
  const isDomElement = typeof type === `string`;

  if (isDomElement) {
    const isTextElement = type === TEXT_ELEMENT;
    const dom = isTextElement
      ? document.createTextNode("")
      : document.createElement(type);
    updateDomProperties(dom, [], props);
    const elementChildren: IElement[] = props[`children`] || [];
    const childrenInstances = elementChildren.map(instantiate);
    childrenInstances
      .map(instance => instance[`dom`])
      .forEach(child => dom.appendChild(child));
    return { dom, element, childrenInstances };
  } else {
    return NEXT_SUCCESSOR;
  }
}

function instantiateComponent({ element }: { element: IElement }) {
  const instance = {};
  const publicInstance = createPublicInstance(element, instance);
  const childElement = publicInstance.render();
  const childInstance = instantiate(childElement);
  const dom = childInstance.dom;
  Object.assign(instance, { dom, element, childInstance, publicInstance });
  return <IInstance>instance;
}

const isListener = (prop: string) => prop.startsWith(`on`);
const isAttribute = (prop: string) => !isListener(prop) && prop !== `children`;

function updateDomProperties(
  dom: Text | HTMLElement,
  prevProps: object,
  nextProps: object
) {
  removePrevListeners(prevProps, dom);
  removePrevAttributes(prevProps, dom);

  addNextListeners(nextProps, dom);
  addNextAttributes(nextProps, dom);
}

const removePrevListeners = (prevProps: object, dom: HTMLElement | Text) =>
  Object.keys(prevProps)
    .filter(isListener)
    .forEach((listener: string) => {
      const eventType = listener.toLocaleLowerCase().substring(2);
      (<HTMLElement>dom).removeEventListener(eventType, prevProps[listener]);
    });

const removePrevAttributes = (prevProps: object, dom: HTMLElement | Text) =>
  Object.keys(prevProps)
    .filter(isAttribute)
    .forEach((attr: string) => (dom[attr] = null));

const addNextListeners = (nextProps: object, dom: HTMLElement | Text) => {
  Object.keys(nextProps)
    .filter(isListener)
    .forEach((listener: string) => {
      const eventType = listener.toLocaleLowerCase().substring(2);
      (<HTMLElement>dom).addEventListener(eventType, nextProps[listener]);
    });
};

const addNextAttributes = (nextProps: object, dom: HTMLElement | Text) =>
  Object.keys(nextProps)
    .filter(isAttribute)
    .forEach((attr: string) => (dom[attr] = nextProps[attr]));
