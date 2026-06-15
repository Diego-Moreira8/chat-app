import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../api/instance";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { LogOut, UserRound } from "lucide-react";

interface HeaderProps {
  username: string;
}

export function Header({ username }: HeaderProps) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => api.get("/api/v1/auth/logout", { withCredentials: true }),
    onSuccess: () => {
      queryClient.setQueryData(["user", "accessToken"], null);
      queryClient.setQueryData(["user", "data"], null);
      navigate({ to: "/entrar" });
    },
  });

  return (
    <header className="flex max-h-12 min-h-12 items-center justify-between px-2">
      <Logo forHeader />

      <div className="flex items-center gap-1 rounded-full bg-black/10 px-4 py-1">
        <UserRound className="h-5 w-fit" />

        <div className="flex flex-col justify-center text-xs leading-3 font-medium">
          <span>{username}</span>

          {/* TODO */}
          <span className="text-[0.5rem]">{"X"} mensagens</span>
        </div>
      </div>

      <Button
        Icon={LogOut}
        type="button"
        size="xs"
        onClick={() => logoutMutation.mutateAsync()}
        loading={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Saindo..." : "Sair"}
      </Button>
    </header>
  );
}
