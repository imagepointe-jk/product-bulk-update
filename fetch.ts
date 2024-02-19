import { ProductData, verifyProductChanges } from "./validation";

export async function updateProduct(productData: ProductData) {
  const productResponse = await getProduct(productData);
  if (productResponse.status !== 200) {
    throw new Error(`Failed to search for product SKU ${productData.sku}.`);
  }
  const productJson = await productResponse.json();
  if (!productJson.length) {
    throw new Error(`Product with SKU ${productData.sku} not found.`);
  }
  const productId = productJson[0].id;

  const myHeaders = new Headers();
  const key = process.env.WOOCOMMERCE_API_KEY!;
  const secret = process.env.WOOCOMMERCE_API_SECRET!;

  if (!key || !secret) {
    console.error("none");
  }
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Basic ${btoa(`${key}:${secret}`)}`);
  const meta_data = [
    {
      id: 2378712,
      key: "promo_price_1",
      value: productData.price1 ? `${productData.price1}` : undefined,
    },
    {
      id: 2378716,
      key: "promo_price_2",
      value: productData.price2 ? `${productData.price2}` : undefined,
    },
    {
      id: 2378720,
      key: "promo_price_3",
      value: productData.price3 ? `${productData.price3}` : undefined,
    },
    {
      id: 2378724,
      key: "promo_price_4",
      value: productData.price4 ? `${productData.price4}` : undefined,
    },
    {
      id: 2378728,
      key: "promo_price_5",
      value: productData.price5 ? `${productData.price5}` : undefined,
    },
    {
      id: 2378710,
      key: "promo_quantity_1",
      value: productData.quantity1 ? `${productData.quantity1}` : undefined,
    },
    {
      id: 2378714,
      key: "promo_quantity_2",
      value: productData.quantity2 ? `${productData.quantity2}` : undefined,
    },
    {
      id: 2378718,
      key: "promo_quantity_3",
      value: productData.quantity3 ? `${productData.quantity3}` : undefined,
    },
    {
      id: 2378722,
      key: "promo_quantity_4",
      value: productData.quantity4 ? `${productData.quantity4}` : undefined,
    },
    {
      id: 2378726,
      key: "promo_quantity_5",
      value: productData.quantity5 ? `${productData.quantity5}` : undefined,
    },
  ].filter((item) => item.value !== undefined);

  const data = JSON.stringify({
    meta_data,
  });

  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: data,
  };

  const updateResponse = await fetch(
    `https://www.imagepointe.com/wp-json/wc/v3/products/${productId}`,
    requestOptions
  );
  if (updateResponse.status !== 200) {
    throw new Error(
      `Error with the update request for product SKU ${productData.sku}.`
    );
  }
  const updateJson = await updateResponse.json();
  return verifyProductChanges(productData, updateJson);
}

async function getProduct(productData: ProductData) {
  const myHeaders = new Headers();
  const key = process.env.WOOCOMMERCE_API_KEY!;
  const secret = process.env.WOOCOMMERCE_API_SECRET!;

  if (!key || !secret) {
    console.error("none");
  }

  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Basic ${btoa(`${key}:${secret}`)}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  return fetch(
    `https://www.imagepointe.com/wp-json/wc/v3/products?sku=${productData.sku}`,
    requestOptions
  );
}
