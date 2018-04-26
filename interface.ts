interface IElement {
  type: string;
  props: object;
}

interface IInstance {
  dom: HTMLElement | Text;
  element: IElement;
  childrenInstances: IInstance[];
}
