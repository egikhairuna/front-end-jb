const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://jamesboogie.com/graphql";

/**
 * Server-side GraphQL fetcher for use in Server Components and Server Actions
 * Leverages Next.js fetch cache, revalidation, and tags.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  options: { revalidate?: number; tags?: string[] } = {}
): Promise<T> {
  const { revalidate = 3600, tags = [] } = options;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: {
        revalidate,
        tags: ['graphql', ...tags],
      },
    });

    const json = await res.json();

    if (json.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(json.errors, null, 2));
      throw new Error(`GraphQL Error: ${json.errors[0]?.message || 'Unknown error'}`);
    }

    return json.data;
  } catch (error) {
    console.error('🌐 GraphQL Fetch Error:', error);
    throw error;
  }
}

/**
 * Legacy support for serverClient.request pattern
 * @deprecated Use fetchGraphQL directly for better cache control
 */
export const serverClient = {
  request: <T>(query: string, variables?: any) => fetchGraphQL<T>(query, variables)
};
