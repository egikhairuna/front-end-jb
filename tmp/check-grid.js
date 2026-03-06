async function checkGrid() {
  const endpoint = 'https://vps.jamesboogie.com/graphql';
  const query = `
    query GetProducts {
      products(first: 20) {
        nodes {
          name
          slug
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log(JSON.stringify(json.data.products.nodes, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkGrid();
