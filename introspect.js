
async function introspect() {
  const query = `
    query IntrospectMutations {
      __type(name: "RootMutation") {
        fields {
          name
        }
      }
    }
  `;

  try {
    const response = await fetch('https://jamesboogie.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const result = await response.json();
    if (result.data \u0026\u0026 result.data.__type) {
        console.log("MUTATIONS:", result.data.__type.fields.map(f =\u003e f.name).join(', '));
    } else {
        console.log("Error:", JSON.stringify(result));
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

introspect();
