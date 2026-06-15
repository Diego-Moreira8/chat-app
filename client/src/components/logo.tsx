import cn from "classnames";

interface LogoProps {
  forHeader?: boolean;
}

export function Logo({ forHeader = false }: LogoProps) {
  return (
    <div
      className={cn(
        "pointer-events-none text-2xl font-black italic select-none",
        forHeader ? "" : "mx-auto",
      )}
    >
      ChatApp
    </div>
  );
}
