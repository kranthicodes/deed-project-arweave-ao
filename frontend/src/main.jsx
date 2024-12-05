import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ArweaveWalletKit } from "arweave-wallet-kit";

createRoot(document.getElementById("root")).render(
  <ArweaveWalletKit
  config={{
    permissions: ["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]
  }}
  >
    <App />
  </ArweaveWalletKit>
);
