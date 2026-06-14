import { Card } from "./card";

interface LaunchScreenContainerProps {
  children: React.ReactNode;
}

export function LaunchScreenContainer({
  children,
}: LaunchScreenContainerProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <Card>
        <div className="flex max-w-md flex-col gap-2 text-center">
          {children}
        </div>
      </Card>
    </div>
  );
}
