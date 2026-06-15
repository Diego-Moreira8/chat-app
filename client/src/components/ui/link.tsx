/**
 * Tanstack Router custom link guide:
 * https://tanstack.com/router/latest/docs/guide/custom-link#createlink-for-cross-cutting-concerns
 */

import * as React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement>((props, ref) => {
  return (
    <a
      ref={ref}
      {...props}
      className="font-medium underline hover:text-cyan-800 dark:hover:text-cyan-200"
    />
  );
});

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const Link: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};
