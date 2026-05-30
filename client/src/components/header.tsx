import type { UserDataResponse } from "@chat-app/shared/validation";
import { Link } from "@tanstack/react-router";

interface HeaderProps {
  userData?: UserDataResponse;
}

export function Header({ userData }: HeaderProps) {
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
      </nav>
    </header>
  );
}
