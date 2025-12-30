import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            accountThemeImplementation: "none",
            themeName: "wewiins-theme",
            keycloakVersionTargets: {
                "22-to-25": false,
                "all-other-versions": "wewiins-theme.jar"
            }
        }),
        tailwindcss()
    ]
});
