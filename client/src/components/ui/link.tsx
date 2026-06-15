/**
 * Tanstack Router custom link guide:
 * https://tanstack.com/router/latest/docs/guide/custom-link#createlink-for-cross-cutting-concerns
 */

import * as React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";

const linkClassName =
  "font-medium underline hover:text-cyan-800 dark:hover:text-cyan-200";

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement>((props, ref) => {
  return <a ref={ref} {...props} className={linkClassName} />;
});

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const AppLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a
      className={linkClassName}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
