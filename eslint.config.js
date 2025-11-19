import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...next, ...nextCoreWebVitals, ...nextTypescript, // Any other config...
...pluginQuery.configs['flat/recommended'], {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}];