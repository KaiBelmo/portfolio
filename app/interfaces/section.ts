export interface Section {
  name: string;
  domElement: HTMLElement | null;
  component: React.FunctionComponent;
}