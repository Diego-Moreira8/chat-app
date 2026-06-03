import { errorCodes } from "@chat-app/shared";
import { isAxiosError } from "axios";

export const handleApiError = (error: unknown): string | null => {
  if (isAxiosError(error)) {
    if (error.code && error.code >= "ERR_NETWORK") {
      return "O servidor está inalcançável. Tente novamente mais tarde.";
    }
    if (error.response?.status && error.response.status >= 500) {
      return "Houve um erro no servidor.";
    }
    if (error.response?.data?.error?.code === errorCodes.VALIDATION_ERROR) {
      return "Há um erro no formulário! Corrija-o e tente novamente.";
    }

    return null;
  }

  console.error(error);
  return "Houve um erro interno. Tente novamente.";
};
