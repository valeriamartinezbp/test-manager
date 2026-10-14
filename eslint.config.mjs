import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Static reference site; kept untouched for parity
    "legacy/**",
    // Generated Prisma client
    "src/server/generated/**",
  ]),
  // Only src/server/ (and the prisma/ scripts) may touch Prisma or the database client
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    ignores: ["src/server/**", "prisma/**", "prisma.config.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@prisma/*", "**/server/generated/**", "@/server/db"],
              message:
                "El acceso a datos vive solo en src/server/. Expón una función en src/server/ y úsala desde aquí.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
