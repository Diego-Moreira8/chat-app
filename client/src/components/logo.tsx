import cn from "classnames";

interface LogoProps {
  forHeader?: boolean;
}

export function Logo({ forHeader = false }: LogoProps) {
  return (
    <div
      className={cn(
        "pointer-events-none font-black italic select-none",
        forHeader ? "text-xl" : "mx-auto text-2xl",
      )}
    >
      ChatApp
    </div>
  );
}
