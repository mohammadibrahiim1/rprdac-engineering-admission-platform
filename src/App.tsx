import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { AuthInitializer } from "./features/auth/auth-components/AuthInitializer";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      <TooltipProvider>
        <AuthInitializer>
          <Toaster richColors position="top-right" />
          <RouterProvider router={router} />
        </AuthInitializer>
      </TooltipProvider>
    </>
  );
}

export default App;
