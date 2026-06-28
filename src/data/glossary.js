export const DEFAULT_GLOSSARY = [
  {
    id: "per",
    term: "PER",
    reading: "ピーイーアール",
    category: "株価指標",
    shortDescription: "株価が1株利益の何倍まで買われているかを示す指標。",
    formula: "PER = 株価 ÷ EPS",
    howToRead: "低いほど割安に見えますが、成長期待が低い企業も低PERになりやすいです。",
    caution: "業種平均や過去水準と比較して見る必要があります。",
    whereToFind: "株価は証券アプリ、EPSは決算短信の1株当たり情報で確認します。"
  },
  {
    id: "pbr",
    term: "PBR",
    reading: "ピービーアール",
    category: "株価指標",
    shortDescription: "株価が1株純資産の何倍まで買われているかを示す指標。",
    formula: "PBR = 株価 ÷ BPS",
    howToRead: "1倍を下回ると解散価値より安いと見られることがあります。",
    caution: "資産価値だけでは成長性や収益性を判断できません。",
    whereToFind: "BPSは決算短信や証券情報サイトで確認します。"
  },
  {
    id: "roe",
    term: "ROE",
    reading: "アールオーイー",
    category: "収益性",
    shortDescription: "株主資本を使ってどれだけ効率よく利益を出したかを示す指標。",
    formula: "ROE = 当期純利益 ÷ 自己資本 × 100",
    howToRead: "高いほど資本効率が良いとされます。",
    caution: "自己資本が少ない企業では高く見える場合があります。",
    whereToFind: "決算短信、決算説明資料、統合報告書などに掲載されます。"
  },
  {
    id: "eps",
    term: "EPS",
    reading: "イーピーエス",
    category: "決算資料用語",
    shortDescription: "1株あたりの純利益。",
    formula: "EPS = 当期純利益 ÷ 発行済株式数",
    howToRead: "EPSが伸びるほど株主に帰属する利益が増えていると考えられます。",
    caution: "一時的利益や自社株買いの影響も確認します。",
    whereToFind: "決算短信の1株当たり当期純利益に掲載されます。"
  },
  {
    id: "free-cash-flow",
    term: "フリーキャッシュフロー",
    reading: "フリーキャッシュフロー",
    category: "キャッシュフロー",
    shortDescription: "会社が自由に使える現金の目安。",
    formula: "営業CF + 投資CF",
    howToRead: "プラスが続く企業は資金余力があると見られます。",
    caution: "成長投資が大きい企業では一時的にマイナスになる場合があります。",
    whereToFind: "キャッシュフロー計算書で確認します。"
  },
  {
    id: "dividend-payout-ratio",
    term: "配当性向",
    reading: "はいとうせいこう",
    category: "株主還元",
    shortDescription: "利益のうち、どれだけを配当に回しているかを示す割合。",
    formula: "配当性向 = 1株配当 ÷ EPS × 100",
    howToRead: "高すぎる場合、将来の減配リスクに注意します。",
    caution: "一時的な利益減少で高く見える場合もあります。",
    whereToFind: "決算説明資料、配当方針、証券情報サイトで確認します。"
  }
];
