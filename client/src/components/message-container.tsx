import cn from "classnames";

interface MessageContainerProps {
  children: React.ReactNode;
  sentByCurrentUser: boolean;
}

export function MessageContainer({
  sentByCurrentUser,
  children,
}: MessageContainerProps) {
  return (
    <li
      className={cn(
        "flex w-fit gap-2 rounded-lg border-2 border-black px-4 py-2 shadow-md dark:border-white",
        sentByCurrentUser
          ? "self-end rounded-br-none bg-cyan-800 text-right text-white"
          : "rounded-tl-none bg-white text-left dark:bg-black",
      )}
    >
      {children}
    </li>
  );
}
