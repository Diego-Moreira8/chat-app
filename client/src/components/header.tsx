import { type UserData } from "@chat-app/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "../api/instance";

interface HeaderProps {
  userData?: UserData;
}

export function Header({ userData }: HeaderProps) {
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
    <header>
      <span>CHAT APP</span>

      <p>{userData ? userData.user.username : "Não autenticado"}</p>

      <nav>
        <ul>
          <li>
            <Link to="/" activeProps={{ style: { fontWeight: "bold" } }}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/entrar" activeProps={{ style: { fontWeight: "bold" } }}>
              Entrar
            </Link>
          </li>
          <li>
            <Link
              to="/criar-conta"
              activeProps={{ style: { fontWeight: "bold" } }}
            >
              Criar conta
            </Link>
          </li>
          <li>
            <Link to="/chat" activeProps={{ style: { fontWeight: "bold" } }}>
              Chat
            </Link>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => logoutMutation.mutateAsync()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Saindo..." : "Sair"}
        </button>
      </nav>
    </header>
  );
}
