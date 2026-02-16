import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://jamesboogie.com/graphql";

/**
 * Server-side GraphQL client for use in Server Components and Server Actions
 * Does not use cookies or browser-specific APIs
 */
export const serverClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});
