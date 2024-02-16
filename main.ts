import { getSourceJson } from "./sheet";
import { parseProductData } from "./validation";

const importSheetName = "WC Bulk Product Import";

async function run() {
  const data = getSourceJson(`./${importSheetName}.xlsx`)["Sheet1"];
  const parsed = parseProductData(data);
  console.log(parsed[0].sku);
}

run();
