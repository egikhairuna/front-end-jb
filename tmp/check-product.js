async function checkProduct() {
  const endpoint = 'https://vps.jamesboogie.com/graphql';
  const query = `
    query GetProduct($id: ID!, $idType: ProductIdTypeEnum!) {
      product(id: $id, idType: $idType) {
        name
        slug
        status
      }
    }
  `;
  const variables = {
    id: "sw-jumper-space-blue",
    idType: "SLUG"
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkProduct();
