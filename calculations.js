import React, { useEffect, useMemo, useState } from "react";
import { Download, Upload, Copy, Save } from "lucide-react";
import { getAll, putItem, exportAllData, importAllData, downloadJson, requestPersistentStorage } from "./lib/storage";
import { calcHolding, calcPortfolioSummary, yen, pct } from "./lib/calculations";
import { readCsvFile, mapCsvRowsToHoldings } from "./lib/csv";
import { DEFAULT_GLOSSARY } from "./data/glossary";
import { PROMPT_TEMPLATES } from "./data/promptTemplates";

const emptyHolding = {
  code: "",
  name: "",
  sector: "",
  accountType: "NISA",
  shares: "",
  averageCost: "",
  currentPrice: "",
  expectedDividendPerShare: "",
  purpose: "",
  reasonForHolding: "",
  sellConditions: "",
  nextCheckPoints: "",
  memo: ""
};

function formatHoldingForPrompt(h) {
  if (!h) return "対象銘柄が選択されていません。";
  return `
銘柄コード：${h.code}
企業名：${h.name}
業種：${h.sector}
口座区分：${h.accountType}
保有株数：${h.shares}
平均取得単価：${h.averageCost}
現在株価：${h.currentPrice}
評価額：${yen(h.marketValue)}
評価損益：${yen(h.unrealizedGainLoss)}
損益率：${pct(h.gainLossRate)}
予想1株配当：${h.expectedDividendPerShare}
配当利回り：${pct(h.dividendYield)}
保有目的：${h.purpose}
保有理由：${h.reasonForHolding}
売却条件：${h.sellConditions}
次回確認事項：${h.nextCheckPoints}
メモ：${h.memo}
`.trim();
}

function formatPortfolioForPrompt(holdings, summary) {
  const rows = holdings.map((h, index) => `
${index + 1}. 銘柄コード：${h.code}
   企業名：${h.name}
   業種：${h.sector}
   口座区分：${h.accountType}
   保有株数：${h.shares}
   平均取得単価：${h.averageCost}
   現在株価：${h.currentPrice}
   評価額：${yen(h.marketValue)}
   評価損益：${yen(h.unrealizedGainLoss)}
   損益率：${pct(h.gainLossRate)}
   配当利回り：${pct(h.dividendYield)}
   保有目的：${h.purpose}
`).join("\n");

  return `
投資元本：${yen(summary.totalCost)}
評価額：${yen(summary.totalValue)}
評価損益：${yen(summary.totalGainLoss)}
損益率：${pct(summary.totalGainLossRate)}
年間配当予定額：${yen(summary.annualDividend)}
ポートフォリオ配当利回り：${pct(summary.portfolioDividendYield)}

【保有銘柄一覧】
${rows || "保有銘柄なし"}
`.trim();
}

function App() {
  const [tab, setTab] = useState("portfolio");
  const [holdings, setHoldings] = useState([]);
  const [profile, setProfile] = useState({
    id: "main",
    purpose: "長期資産形成",
    period: "10年以上",
    riskTolerance: "普通",
    focus: "配当、増配、安定性、割安性",
    avoid: "大きな値下がり、減配、特定業種への集中"
  });
  const [holdingForm, setHoldingForm] = useState(emptyHolding);
  const [selectedHoldingId, setSelectedHoldingId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("portfolio_review");
  const [reportText, setReportText] = useState("");
  const [glossaryTerm, setGlossaryTerm] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [decisionMemo, setDecisionMemo] = useState("");
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvEncoding, setCsvEncoding] = useState("AUTO");

  const summary = useMemo(() => calcPortfolioSummary(holdings), [holdings]);
  const selectedHolding = holdings.find((h) => h.id === selectedHoldingId) || holdings[0];

  useEffect(() => {
    async function load() {
      await requestPersistentStorage();
      setHoldings(await getAll("holdings"));
      const profiles = await getAll("profile");
      if (profiles[0]) setProfile(profiles[0]);
    }
    load();
  }, []);

  async function saveHolding() {
    const record = await putItem("holdings", calcHolding(holdingForm));
    setHoldings((prev) => {
      const others = prev.filter((h) => h.id !== record.id);
      return [...others, record];
    });
    setHoldingForm(emptyHolding);
  }

  async function saveProfile() {
    const saved = await putItem("profile", { ...profile, id: "main" });
    setProfile(saved);
    alert("投資方針プロフィールを保存しました。");
  }

  async function handleCsvFile(file) {
    const rows = await readCsvFile(file, csvEncoding);
    const mapped = mapCsvRowsToHoldings(rows, file?.name || "portfolio.csv");
    setCsvPreview(mapped);
  }

  async function importCsvPreview() {
    for (const h of csvPreview) {
      await putItem("holdings", h);
    }
    await putItem("importHistory", {
      id: crypto.randomUUID(),
      importedAt: new Date().toISOString(),
      rowCount: csvPreview.length,
      importedCount: csvPreview.length
    });
    setHoldings(await getAll("holdings"));
    setCsvPreview([]);
    alert("CSVを取り込みました。");
  }

  function buildProfileText() {
    return `
投資目的：${profile.purpose}
投資期間：${profile.period}
リスク許容度：${profile.riskTolerance}
重視すること：${profile.focus}
避けたいこと：${profile.avoid}
`.trim();
  }

  function generatePrompt() {
    const template = PROMPT_TEMPLATES.find((t) => t.id === selectedTemplateId);
    const prompt = template.build({
      profileText: buildProfileText(),
      portfolioText: formatPortfolioForPrompt(holdings, summary),
      selectedHoldingText: formatHoldingForPrompt(selectedHolding),
      reportText,
      glossaryTerm
    });
    setGeneratedPrompt(prompt);
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(generatedPrompt);
    alert("プロンプトをコピーしました。");
  }

  async function saveAiResponse() {
    await putItem("aiResponses", {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      templateId: selectedTemplateId,
      prompt: generatedPrompt,
      response: aiResponse,
      decisionMemo
    });
    alert("AI回答と判断メモを保存しました。");
    setAiResponse("");
    setDecisionMemo("");
  }

  async function backup() {
    const data = await exportAllData();
    downloadJson(data);
  }

  async function restore(file) {
    if (!file) return;
    const text = await file.text();
    await importAllData(JSON.parse(text));
    setHoldings(await getAll("holdings"));
    alert("バックアップを読み込みました。");
  }

  return (
    <div className="app">
      <header>
        <h1>投資判断AIノート</h1>
        <p>決算資料・ポートフォリオ・投資用語・AI相談プロンプトを一体管理します。</p>
      </header>

      <nav className="tabs">
        {[
          ["portfolio", "ポートフォリオ"],
          ["csv", "CSV取り込み"],
          ["prompt", "AI相談プロンプト"],
          ["glossary", "投資用語辞書"],
          ["profile", "投資方針"],
          ["backup", "バックアップ"]
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "portfolio" && (
        <section className="card">
          <h2>ポートフォリオ</h2>
          <div className="summary">
            <div>投資元本<br /><strong>{yen(summary.totalCost)}</strong></div>
            <div>評価額<br /><strong>{yen(summary.totalValue)}</strong></div>
            <div>評価損益<br /><strong>{yen(summary.totalGainLoss)}（{pct(summary.totalGainLossRate)}）</strong></div>
            <div>年間配当<br /><strong>{yen(summary.annualDividend)}</strong></div>
            <div>配当利回り<br /><strong>{pct(summary.portfolioDividendYield)}</strong></div>
          </div>

          <h3>保有銘柄を追加</h3>
          <div className="grid">
            {Object.keys(emptyHolding).map((key) => (
              <label key={key}>
                {key}
                <input
                  value={holdingForm[key] || ""}
                  onChange={(e) => setHoldingForm({ ...holdingForm, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <button onClick={saveHolding}><Save size={16} /> 保存</button>

          <h3>保有銘柄一覧</h3>
          <table>
            <thead>
              <tr>
                <th>コード</th><th>企業名</th><th>口座</th><th>株数</th><th>取得単価</th><th>現在株価</th><th>評価損益</th><th>利回り</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id}>
                  <td>{h.code}</td>
                  <td>{h.name}</td>
                  <td>{h.accountType}</td>
                  <td>{h.shares}</td>
                  <td>{h.averageCost}</td>
                  <td>{h.currentPrice}</td>
                  <td>{yen(h.unrealizedGainLoss)} / {pct(h.gainLossRate)}</td>
                  <td>{pct(h.dividendYield)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "csv" && (
        <section className="card">
          <h2>証券アプリCSV取り込み</h2>
          <label>
            文字コード
            <select value={csvEncoding} onChange={(e) => setCsvEncoding(e.target.value)}>
              <option value="AUTO">自動判定</option>
              <option value="UTF8">UTF-8</option>
              <option value="SJIS">Shift-JIS</option>
            </select>
          </label>
          <input type="file" accept=".csv,text/csv" onChange={(e) => handleCsvFile(e.target.files?.[0])} />
          <button disabled={!csvPreview.length} onClick={importCsvPreview}><Upload size={16} /> 取り込み実行</button>

          <table>
            <thead>
              <tr><th>コード</th><th>企業名</th><th>株数</th><th>取得単価</th><th>現在株価</th><th>評価額</th></tr>
            </thead>
            <tbody>
              {csvPreview.map((h) => (
                <tr key={h.id}>
                  <td>{h.code}</td><td>{h.name}</td><td>{h.shares}</td><td>{h.averageCost}</td><td>{h.currentPrice}</td><td>{yen(h.marketValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "prompt" && (
        <section className="card">
          <h2>目的別AI相談プロンプト</h2>
          <label>
            テンプレート
            <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
              {PROMPT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.category}：{t.name}</option>
              ))}
            </select>
          </label>

          <label>
            対象銘柄
            <select value={selectedHoldingId} onChange={(e) => setSelectedHoldingId(e.target.value)}>
              <option value="">未選択</option>
              {holdings.map((h) => <option key={h.id} value={h.id}>{h.code} {h.name}</option>)}
            </select>
          </label>

          <label>
            決算メモ・資料テキスト
            <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} />
          </label>

          <label>
            投資用語
            <input value={glossaryTerm} onChange={(e) => setGlossaryTerm(e.target.value)} placeholder="例：ROE" />
          </label>

          <button onClick={generatePrompt}>プロンプト生成</button>
          <button onClick={copyPrompt} disabled={!generatedPrompt}><Copy size={16} /> コピー</button>

          <textarea className="large" value={generatedPrompt} onChange={(e) => setGeneratedPrompt(e.target.value)} />

          <h3>AI回答を保存</h3>
          <textarea placeholder="外部AIの回答を貼り付け" value={aiResponse} onChange={(e) => setAiResponse(e.target.value)} />
          <textarea placeholder="自分の判断メモ" value={decisionMemo} onChange={(e) => setDecisionMemo(e.target.value)} />
          <button onClick={saveAiResponse}>AI回答と判断メモを保存</button>
        </section>
      )}

      {tab === "glossary" && (
        <section className="card">
          <h2>投資用語辞書</h2>
          <input placeholder="用語検索" value={glossaryTerm} onChange={(e) => setGlossaryTerm(e.target.value)} />
          <div className="glossary">
            {DEFAULT_GLOSSARY
              .filter((g) => !glossaryTerm || g.term.includes(glossaryTerm) || g.category.includes(glossaryTerm))
              .map((g) => (
                <article key={g.id}>
                  <h3>{g.term}</h3>
                  <p><strong>カテゴリ：</strong>{g.category}</p>
                  <p><strong>ひとことで：</strong>{g.shortDescription}</p>
                  <p><strong>計算式：</strong>{g.formula}</p>
                  <p><strong>見方：</strong>{g.howToRead}</p>
                  <p><strong>注意点：</strong>{g.caution}</p>
                  <p><strong>資料で見る場所：</strong>{g.whereToFind}</p>
                </article>
              ))}
          </div>
        </section>
      )}

      {tab === "profile" && (
        <section className="card">
          <h2>投資方針プロフィール</h2>
          {[
            ["purpose", "投資目的"],
            ["period", "投資期間"],
            ["riskTolerance", "リスク許容度"],
            ["focus", "重視すること"],
            ["avoid", "避けたいこと"]
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input value={profile[key] || ""} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
            </label>
          ))}
          <button onClick={saveProfile}>保存</button>
        </section>
      )}

      {tab === "backup" && (
        <section className="card">
          <h2>バックアップ / 復元</h2>
          <p>ブラウザ保存は消える可能性があるため、定期的にJSONバックアップを作成します。</p>
          <button onClick={backup}><Download size={16} /> JSONを書き出し</button>
          <input type="file" accept="application/json" onChange={(e) => restore(e.target.files?.[0])} />
        </section>
      )}
    </div>
  );
}

export default App;
