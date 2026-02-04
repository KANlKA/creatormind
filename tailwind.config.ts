import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/tw-animate-css/**/*.js",
  ],
  plugins: [require("tw-animate-css")],
}

export default config
