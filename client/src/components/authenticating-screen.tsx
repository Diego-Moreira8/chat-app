import { UserRoundKey } from "lucide-react";
import { LaunchScreenContainer } from "./ui/launch-screen-container";

export function AuthenticatingScreen() {
  return (
    <LaunchScreenContainer>
      <UserRoundKey className="mx-auto size-8" />

      <h1 className="text-2xl font-bold">Autenticando</h1>

      <p>Tentando autenticar com o último usuário conectado...</p>
    </LaunchScreenContainer>
  );
}
