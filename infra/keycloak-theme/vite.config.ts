import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { themeIds, colorSchemeByTheme, defaultLightThemeId, defaultDarkThemeId } from "./src/theme/generated/theme-ids";

// Resolves the active theme before first paint (no flash of the wrong theme):
// ?ui_theme= query param (set by the mobile app on the auth request) -> sessionStorage
// (covers Keycloak's own form post-backs, which drop custom query params) ->
// prefers-color-scheme default. See docs/plans/themeable-login-plan.md §5.3.
function themeBootstrapPlugin(): Plugin {
  const storageKey = "project.theme";
  const script = `(function(){try{var ids=${JSON.stringify(themeIds)};var schemes=${JSON.stringify(colorSchemeByTheme)};var params=new URLSearchParams(location.search);var id=params.get("ui_theme");if(id&&ids.indexOf(id)===-1){id=null;}if(id){try{sessionStorage.setItem(${JSON.stringify(storageKey)},id);}catch(e){}}else{try{var stored=sessionStorage.getItem(${JSON.stringify(storageKey)});if(stored&&ids.indexOf(stored)!==-1){id=stored;}}catch(e){}}if(!id){id=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?${JSON.stringify(defaultDarkThemeId)}:${JSON.stringify(defaultLightThemeId)};}document.documentElement.dataset.theme=id;document.documentElement.style.colorScheme=schemes[id]||"light";}catch(e){}})();`;

  return {
    name: "project-theme-bootstrap",
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: "script",
            injectTo: "head-prepend",
            children: script,
          },
        ],
      };
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    themeBootstrapPlugin(),
    keycloakify({
      accountThemeImplementation: "none",
      themeName: "project",
    }),
  ],
});
