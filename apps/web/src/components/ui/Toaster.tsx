import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(215 20% 13%)",
          border: "1px solid hsl(142 55% 45% / .4)",
          color: "hsl(208 32% 88%)",
          borderRadius: "11px",
          boxShadow: "0 12px 36px hsl(216 50% 2% / .55)",
          fontSize: "13px",
        },
      }}
    />
  );
}
