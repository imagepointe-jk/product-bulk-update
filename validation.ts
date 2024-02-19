import { z } from "zod";
import { spellNumber } from "./utility";

const productSchema = z.object({
  sku: z.string(),
  quantity1: z.number().optional(),
  quantity2: z.number().optional(),
  quantity3: z.number().optional(),
  quantity4: z.number().optional(),
  quantity5: z.number().optional(),
  price1: z.number().optional(),
  price2: z.number().optional(),
  price3: z.number().optional(),
  price4: z.number().optional(),
  price5: z.number().optional(),
  netCost: z.number().optional(),
  pricingSchedule: z.number().optional(),
});

export function parseProductData(product: any) {
  return productSchema.parse(product);
}

export function verifyProductChanges(
  productChangeData: ProductData,
  updateResponseJson: any
) {
  const responseMetaData = updateResponseJson.meta_data as any[];

  function findMetaDataValue(key: string, metaData: any[]) {
    return metaData.find((metaData) => metaData.key === key)?.value;
  }

  const newProductData: any = {
    quantity1: findMetaDataValue("promo_quantity_1", responseMetaData),
    quantity2: findMetaDataValue("promo_quantity_2", responseMetaData),
    quantity3: findMetaDataValue("promo_quantity_3", responseMetaData),
    quantity4: findMetaDataValue("promo_quantity_4", responseMetaData),
    quantity5: findMetaDataValue("promo_quantity_5", responseMetaData),
    price1: findMetaDataValue("promo_price_1", responseMetaData),
    price2: findMetaDataValue("promo_price_2", responseMetaData),
    price3: findMetaDataValue("promo_price_3", responseMetaData),
    price4: findMetaDataValue("promo_price_4", responseMetaData),
    price5: findMetaDataValue("promo_price_5", responseMetaData),
    netCost: findMetaDataValue("base_price", responseMetaData),
    pricingSchedule: findMetaDataValue("markup_schedule", responseMetaData),
  };

  const valuesSynced = Object.entries(productChangeData).reduce(
    (accum, [key, value]) => {
      const valueToCompare =
        key === "pricingSchedule" ? spellNumber(+value) : value;
      if (`${valueToCompare}` === `${newProductData[key]}`) return accum + 1;
      return accum;
    },
    0
  );
  const expectedValuesSynced = Object.entries(productChangeData).reduce(
    (accum, [key, value]) => {
      const keysToIgnore = ["sku"];
      if (value === undefined || keysToIgnore.includes(key)) return accum;
      return accum + 1;
    },
    0
  );

  return {
    valuesSynced,
    expectedValuesSynced,
  };
}

export type ProductData = z.infer<typeof productSchema>;
