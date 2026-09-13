export const strategyConfig = {
  atr: {
    period: 14,
    stopMultiplier: {
      min: 1.0,
      default: 1.5,
      max: 3.0,
    },
    targetMultiplier: {
      min: 1.5,
      default: 2.5,
      max: 6.0,
    },
  },

  rvol: {
    period: 20,
    minimumTrend: 1.2,
    minimumMeanReversion: 0.8,
    maximumMeanReversion: 1.8,
  },

  efficiencyRatio: {
    period: 20,
    trendMinimum: 0.35,
    rangeMaximum: 0.25,
  },

  volatility: {
    atrPercent: {
      lowMaximum: 0.008,
      normalMaximum: 0.02,
      highMaximum: 0.04,
    },
    highVolatilityRiskMultiplier: 0.5,
    killSwitchAtrPercent: 0.06,
  },

  risk: {
    accountRiskPerTrade: 0.005,
    maximumDrawdown: 0.15,
    maximumOpenPositions: 10,
    maximumDailyLoss: 0.03,
    maximumPositionValuePercent: 0.2,
  },

  liquidity: {
    minimumAverageVolume: 100_000,
    minimumAverageTurnover: 10_000_000,
    maximumParticipationRate: 0.1,
  },

  costs: {
    slippageBps: 5,
    commissionBps: 3,
    taxesBps: 1,
  },
} as const;
