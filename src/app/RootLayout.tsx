import { Outlet, ScrollRestoration } from "react-router";
import { GlobalProgress } from "./components/ui/global-progress";
import { NetworkBanner } from "./components/ui/network-banner";

export function RootLayout() {
  return (
    <>
      <NetworkBanner />
      <GlobalProgress />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
