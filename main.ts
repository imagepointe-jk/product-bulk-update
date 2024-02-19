import { ZodError } from "zod";
import { updateProduct } from "./fetch";
import { getSourceJson, writeAsSheet } from "./sheet";
import { parseProductData } from "./validation";
import dotenv from "dotenv";

const importSheetName = "WC Bulk Product Import";
dotenv.config();

type UpdateResult = {
  sku: string;
  success: boolean;
  message: string;
};

async function run() {
  const asiRows = getSourceJson(`./${importSheetName}.xlsx`)["asi"];
  const garmentRows = getSourceJson(`./${importSheetName}.xlsx`)["garment"];
  const allRows = asiRows.concat(garmentRows);
  const results: UpdateResult[] = [];

  for (let i = 0; i < allRows.length; i++) {
    const item = allRows[i];
    const completePercent = Math.round((i / allRows.length) * 100);
    console.log(
      `${completePercent}% complete...Preparing to update product SKU ${item.sku}.`
    );
    try {
      const parsed = parseProductData(item);
      const { valuesSynced, expectedValuesSynced } = await updateProduct(
        parsed
      );
      if (valuesSynced !== expectedValuesSynced) {
        throw new Error(
          `Only ${valuesSynced} values were synced, but ${expectedValuesSynced} were expected.`
        );
      }
      results.push({
        sku: item.sku,
        success: true,
        message: `${valuesSynced} of ${expectedValuesSynced} values synced.`,
      });
    } catch (error) {
      console.error(`Failed to update product ${item.sku}.`, error);
      const message = error instanceof ZodError ? "Parse error." : error;
      results.push({
        sku: item.sku,
        success: false,
        message: `${message}`,
      });
    }
  }
  console.log("Sync complete, writing results to sheet.");
  writeAsSheet(results, "WC Bulk Product Import Results");
}

run();
