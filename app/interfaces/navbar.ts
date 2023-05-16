export interface NavElement {
  link: string;
  label: string;
  external: boolean;
}

export interface NavProps {
  handleLinkClick: React.MouseEventHandler<HTMLAnchorElement>;
}