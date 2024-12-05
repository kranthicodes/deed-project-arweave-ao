import { defineConfig } from "ao-deploy";

export default defineConfig({
  "deed-contract": {
    name: "deed-contract",
    contractPath: "src/contract.lua",
    luaPath: "./src/?.lua",
  },
});
