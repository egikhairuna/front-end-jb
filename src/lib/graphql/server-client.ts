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

  // 🛡️ Evaluate endpoint at runtime to ensure environment variables are correctly picked up
  // especially during ISR revalidation on the server.
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://jamesboogie.com/graphql";

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

    if (!res.ok) {
        const text = await res.text();
        console.error(`❌ GraphQL HTTP Error: ${res.status} ${res.statusText}`, text);
        throw new Error(`HTTP Error: ${res.status}`);
    }

    const json = await res.json();

    if (json.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(json.errors, null, 2));
      throw new Error(`GraphQL Error: ${json.errors[0]?.message || 'Unknown error'}`);
    }

    return json.data;
  } catch (error) {
    console.error(`🌐 GraphQL Fetch Error [${endpoint}]:`, error);
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
