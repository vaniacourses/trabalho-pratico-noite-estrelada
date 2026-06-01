import type { Config } from "eslint";
import nextPlugin from "@next/eslint-config";

const config: Config = {
  extends: ["next"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
};

export default config;
