import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./queryClient";
import { router } from "./router";
import { api } from "./api/instance";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Server wake-up
let initialized = false;
(async () => {
  if (initialized) return;
  await api.get("/ping");
  initialized = true;
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>,
);
