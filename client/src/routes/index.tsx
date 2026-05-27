/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <>
      <h1>Bem-vindo(a) ao chat!</h1>
    </>
  );
}
