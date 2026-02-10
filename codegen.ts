
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://jamesboogie.com/graphql",
  documents: "src/lib/graphql/**/*.ts",
  generates: {
    "src/lib/graphql/gql/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
