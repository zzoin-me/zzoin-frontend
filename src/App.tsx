import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "@/router";
import { useAuthStore } from "@/stores/authStore";

function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <RouterProvider router={router} />;
}

export default App;
