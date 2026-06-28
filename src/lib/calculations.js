export function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = String(value)
    .replace(/[円,%％株\s]/g, "")
    .replace(/,/g, "")
    .replace("▲", "-");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function calcHolding(raw) {
  const shares = toNumber(raw.shares);
  const averageCost = toNumber(raw.averageCost);
  const currentPrice = toNumber(raw.currentPrice);
  const expectedDividendPerShare = toNumber(raw.expectedDividendPerShare);

  const acquisitionAmount = shares * averageCost;
  const marketValue = shares * currentPrice;
  const unrealizedGainLoss = marketValue - acquisitionAmount;
  const gainLossRate = acquisitionAmount ? (unrealizedGainLoss / acquisitionAmount) * 100 : 0;
  const annualDividend = shares * expectedDividendPerShare;
  const dividendYield = currentPrice ? (expectedDividendPerShare / currentPrice) * 100 : 0;

  return {
    ...raw,
    shares,
    averageCost,
    currentPrice,
    expectedDividendPerShare,
    acquisitionAmount,
    marketValue,
    unrealizedGainLoss,
    gainLossRate,
    annualDividend,
    dividendYield
  };
}

export function calcPortfolioSummary(holdings) {
  const totalCost = holdings.reduce((sum, h) => sum + toNumber(h.acquisitionAmount), 0);
  const totalValue = holdings.reduce((sum, h) => sum + toNumber(h.marketValue), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossRate = totalCost ? (totalGainLoss / totalCost) * 100 : 0;
  const annualDividend = holdings.reduce((sum, h) => sum + toNumber(h.annualDividend), 0);
  const portfolioDividendYield = totalValue ? (annualDividend / totalValue) * 100 : 0;

  return {
    totalCost,
    totalValue,
    totalGainLoss,
    totalGainLossRate,
    annualDividend,
    portfolioDividendYield
  };
}

export function yen(value) {
  return `${Math.round(toNumber(value)).toLocaleString("ja-JP")}円`;
}

export function pct(value) {
  return `${toNumber(value).toFixed(2)}%`;
}
