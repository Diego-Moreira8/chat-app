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
    <header className="flex items-center justify-between">
      <Logo forHeader />

      <span className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-1">
        <UserRound className="h-4 w-fit" /> <span>{username}</span>
      </span>

      <Button
        Icon={LogOut}
        type="button"
        size="sm"
        onClick={() => logoutMutation.mutateAsync()}
        loading={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Saindo..." : "Sair"}
      </Button>
    </header>
  );
}
