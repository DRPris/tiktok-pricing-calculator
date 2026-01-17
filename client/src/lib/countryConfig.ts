/**
 * 东南亚各国TikTok Shop费用配置
 * 数据来源：TikTok Shop官方商家大学 (2026年1月)
 */

export interface CountryConfig {
  code: string;
  name: string;
  nameCN: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToCNY: number; // 1 unit local currency = X CNY
  
  // 平台费率
  commissionRate: {
    electronics?: number;
    other?: number;
    range?: [number, number]; // 按类目范围
  };
  
  transactionFeeRate: number;
  
  commerceGrowthRate?: {
    electronics?: number;
    other?: number;
    cap?: number; // 上限金额
  };
  
  infrastructureFee?: number; // 固定费用
  orderProcessingFee?: number; // 订单处理费
  
  // 税费
  vatRate: number;
  vatName: string; // VAT/GST/SST名称
  dutyRateRange: [number, number];
  
  // 新商家政策
  newSellerBenefit?: string;
  
  // 备注
  notes?: string[];
}

export const COUNTRIES: Record<string, CountryConfig> = {
  TH: {
    code: 'TH',
    name: 'Thailand',
    nameCN: '泰国',
    currency: 'THB',
    currencySymbol: '฿',
    exchangeRateToCNY: 0.20,
    commissionRate: {
      electronics: 0.0535,
      other: 0.0642,
    },
    transactionFeeRate: 0.0321,
    commerceGrowthRate: {
      electronics: 0.0535,
      other: 0.0642,
      cap: 199,
    },
    infrastructureFee: 1.07,
    vatRate: 0.07,
    vatName: 'VAT',
    dutyRateRange: [0, 0.30],
    newSellerBenefit: '前30天电商增长服务费免收(上限5000泰铢)',
    notes: [
      '电商增长服务费单件上限199泰铢',
      '平台基础设施费按订单收取',
      '2024年4月起交易手续费调整为3.21%',
    ],
  },
  
  VN: {
    code: 'VN',
    name: 'Vietnam',
    nameCN: '越南',
    currency: 'VND',
    currencySymbol: '₫',
    exchangeRateToCNY: 0.00029,
    commissionRate: {
      other: 0.05,
    },
    transactionFeeRate: 0.0321,
    vatRate: 0.10,
    vatName: 'VAT',
    dutyRateRange: [0, 0.30],
    newSellerBenefit: '入驻后30天内完成任务可获最长90天免佣',
    notes: [
      '2025年7月15日起固定佣金5%',
      '2025年2月18日起VAT调整为10%',
      '2025年2月23日起代扣高价值商品关税',
    ],
  },
  
  PH: {
    code: 'PH',
    name: 'Philippines',
    nameCN: '菲律宾',
    currency: 'PHP',
    currencySymbol: '₱',
    exchangeRateToCNY: 0.13,
    commissionRate: {
      range: [0.05, 0.091],
    },
    transactionFeeRate: 0.0224,
    vatRate: 0.12,
    vatName: 'VAT',
    dutyRateRange: [0, 0.30],
    newSellerBenefit: '入驻后30天内完成任务可获最长90天免佣',
    notes: [
      '2025年1月15日起按子类目收取5%-9.1%佣金',
      '存在订单处理费(Order Processing Fee)',
      'Mall商家和非Mall商家佣金不同',
    ],
  },
  
  MY: {
    code: 'MY',
    name: 'Malaysia',
    nameCN: '马来西亚',
    currency: 'MYR',
    currencySymbol: 'RM',
    exchangeRateToCNY: 1.60,
    commissionRate: {
      range: [0.04, 0.08], // 基础+涨佣后
    },
    transactionFeeRate: 0.0378,
    vatRate: 0.08,
    vatName: 'SST',
    dutyRateRange: [0, 0.30],
    newSellerBenefit: '入驻起90天直接免佣，无需完成任务',
    notes: [
      '2025年9月13日起非BXP商家佣金+4%',
      '按子类目收取佣金',
      'BXP商家本次不涉及涨佣',
    ],
  },
  
  SG: {
    code: 'SG',
    name: 'Singapore',
    nameCN: '新加坡',
    currency: 'SGD',
    currencySymbol: 'S$',
    exchangeRateToCNY: 5.30,
    commissionRate: {
      other: 0.0327,
    },
    transactionFeeRate: 0.0218,
    vatRate: 0.09,
    vatName: 'GST',
    dutyRateRange: [0, 0.05], // 大部分商品免税
    newSellerBenefit: '入驻后30天内完成任务可获最长90天免佣',
    notes: [
      '2025年7月15日起固定佣金3.27%',
      '大部分商品免关税',
      '2024年1月1日起征收低价值商品税',
    ],
  },
};

export const COUNTRY_LIST = Object.values(COUNTRIES);

export function getCountryConfig(code: string): CountryConfig | undefined {
  return COUNTRIES[code];
}

export function getCommissionRate(
  countryCode: string,
  category: 'electronics' | 'other'
): number {
  const config = COUNTRIES[countryCode];
  if (!config) return 0;
  
  if (config.commissionRate.range) {
    // 使用范围的中间值
    const [min, max] = config.commissionRate.range;
    return (min + max) / 2;
  }
  
  return config.commissionRate[category] || config.commissionRate.other || 0;
}

export function getCommerceGrowthRate(
  countryCode: string,
  category: 'electronics' | 'other'
): { rate: number; cap?: number } {
  const config = COUNTRIES[countryCode];
  if (!config || !config.commerceGrowthRate) {
    return { rate: 0 };
  }
  
  return {
    rate: config.commerceGrowthRate[category] || config.commerceGrowthRate.other || 0,
    cap: config.commerceGrowthRate.cap,
  };
}
