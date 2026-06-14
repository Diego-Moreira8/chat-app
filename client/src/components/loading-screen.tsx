import { LoaderCircle } from "lucide-react";
import { LaunchScreenContainer } from "./ui/launch-screen-container";

interface LoadingScreenProps {
  failureCount: number;
}

export function LoadingScreen({ failureCount }: LoadingScreenProps) {
  return (
    <LaunchScreenContainer>
      <LoaderCircle className="mx-auto size-8 animate-spin" />

      <h1 className="text-2xl font-bold">Acordando servidor...</h1>

      <p>
        Este aplicativo está hospedado em um serviço gratuito. Por isso, a
        primeira inicialização pode levar até um minuto.
        <br />
        Obrigado pela paciência!
      </p>

      {failureCount > 0 && (
        <p className="text-xs">Houve uma falha. Tentando novamente.</p>
      )}
    </LaunchScreenContainer>
  );
}
