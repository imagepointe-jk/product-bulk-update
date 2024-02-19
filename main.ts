import { ZodError } from "zod";
import { updateProduct } from "./fetch";
import { getSourceJson, writeAsSheet } from "./sheet";
import { parseProductData } from "./validation";
import dotenv from "dotenv";

const importSheetName = "WC Bulk Product Import";
dotenv.config();

async function run() {
  const data = getSourceJson(`./${importSheetName}.xlsx`)["Sheet1"];
  const results: { sku: string; success: boolean; message: string }[] = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const completePercent = Math.round((i / data.length) * 100);
    console.log(
      `${completePercent}% complete...Preparing to update product SKU ${row.sku}.`
    );
    try {
      const parsed = parseProductData(row);
      const { valuesSynced, expectedValuesSynced } = await updateProduct(
        parsed
      );
      if (valuesSynced !== expectedValuesSynced) {
        throw new Error(
          `Only ${valuesSynced} values were synced, but ${expectedValuesSynced} were expected.`
        );
      }
      results.push({
        sku: row.sku,
        success: true,
        message: `${valuesSynced} of ${expectedValuesSynced} values synced.`,
      });
    } catch (error) {
      console.error(`Failed to update product ${row.sku}.`, error);
      const message = error instanceof ZodError ? "Parse error." : error;
      results.push({
        sku: row.sku,
        success: false,
        message: `${message}`,
      });
    }
  }
  console.log("Sync complete, writing results to sheet.");
  writeAsSheet(results, "WC Bulk Product Import Results");
}

run();
