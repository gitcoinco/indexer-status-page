import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

export const config: ReturnType<typeof getDefaultConfig> = getDefaultConfig({
  appName: "Indexer Status Page",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet],
  ssr: true,
});
