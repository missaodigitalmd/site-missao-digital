import { useEffect, useState } from "react";
import { TeamScreen } from "@/components/team/TeamScreen";
import { PanelScreen } from "@/components/panel/PanelScreen";
import { ContentPreview } from "@/components/preview/ContentPreview";
import { DevHome } from "@/components/DevHome";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}

export function App() {
  const hash = useHashRoute();
  const route = hash.replace(/^#/, "");

  if (route.startsWith("/equipe")) {
    const token = route.split("/")[2] ?? "demo";
    return <TeamScreen token={token} />;
  }
  if (route.startsWith("/painel")) {
    return <PanelScreen />;
  }
  if (route.startsWith("/conteudo")) {
    return <ContentPreview />;
  }
  return <DevHome />;
}
