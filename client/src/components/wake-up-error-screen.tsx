import { GlobeOff } from "lucide-react";
import { LaunchScreenContainer } from "./ui/launch-screen-container";

export function WakeUpErrorScreen() {
  return (
    <LaunchScreenContainer>
      <GlobeOff className="mx-auto size-8" />

      <h1 className="text-2xl font-bold">O servidor não respondeu!</h1>

      <p>Tente novamente mais tarde.</p>
    </LaunchScreenContainer>
  );
}
