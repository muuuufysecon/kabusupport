import Papa from "papaparse";
import Encoding from "encoding-japanese";
import { calcHolding } from "./calculations";

const COLUMN_ALIASES = {
  code: ["銘柄コード", "コード", "証券コード", "コード番号"],
  name: ["銘柄名", "名称", "企業名"],
  sector: ["業種", "セクター"],
  accountType: ["口座区分", "口座", "預り区分", "NISA区分"],
  shares: ["保有数量", "数量", "保有株数", "株数"],
  averageCost: ["平均取得価額", "取得単価", "平均取得単価", "取得価額"],
  currentPrice: ["現在値", "現在株価", "時価", "株価"],
  marketValue: ["評価額", "時価評価額"],
  unrealizedGainLoss: ["評価損益", "含み損益", "損益"],
  gainLossRate: ["損益率", "評価損益率"],
  expectedDividendPerShare: ["予想配当", "1株配当", "予想1株配当"],
  dividendYield: ["配当利回り", "利回り"]
};

function findColumn(row, aliases) {
  const keys = Object.keys(row);
  return keys.find((key) => aliases.includes(key));
}

export async function readCsvFile(file, encoding = "AUTO") {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let unicodeArray;
  if (encoding === "UTF8") {
    unicodeArray = Encoding.convert(bytes, { to: "UNICODE", from: "UTF8" });
  } else if (encoding === "SJIS") {
    unicodeArray = Encoding.convert(bytes, { to: "UNICODE", from: "SJIS" });
  } else {
    unicodeArray = Encoding.convert(bytes, { to: "UNICODE", from: "AUTO" });
  }

  const text = Encoding.codeToString(unicodeArray);
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors?.length) {
    console.warn("CSV parse errors:", parsed.errors);
  }

  return parsed.data.filter((row) => {
    const joined = Object.values(row).join("");
    return joined && !joined.includes("合計") && !joined.includes("総合計");
  });
}

export function mapCsvRowsToHoldings(rows, fileName = "portfolio.csv", broker = "汎用CSV") {
  return rows.map((row) => {
    const mapped = {};

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      const column = findColumn(row, aliases);
      mapped[field] = column ? row[column] : "";
    }

    const code = String(mapped.code || "").trim();
    const accountType = String(mapped.accountType || "未設定").trim();

    return calcHolding({
      id: `holding_${code || crypto.randomUUID()}_${accountType}`,
      code,
      name: String(mapped.name || "").trim(),
      sector: String(mapped.sector || "").trim(),
      accountType,
      shares: mapped.shares,
      averageCost: mapped.averageCost,
      currentPrice: mapped.currentPrice,
      expectedDividendPerShare: mapped.expectedDividendPerShare,
      purpose: "",
      reasonForHolding: "",
      sellConditions: "",
      nextCheckPoints: "",
      memo: "",
      source: {
        type: "csv",
        importedAt: new Date().toISOString(),
        fileName,
        broker
      }
    });
  });
}
