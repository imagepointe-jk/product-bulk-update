import { z } from "zod";

const productSchema = z.object({
  sku: z.string(),
});

export function parseProductData(products: any[]) {
  return z.array(productSchema).parse(products);
}

export type ProductData = z.infer<typeof productSchema>;
