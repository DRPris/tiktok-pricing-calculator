/**
 * 东南亚各国TikTok Shop费用配置
 * 数据来源：TikTok Shop官方商家大学 (2026年1月)
 * 最后更新：2026-01-17
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
    bxp?: {
      // 马来西亚BXP卖家专用
      electronics?: number;
      other?: number;
      range?: [number, number];
    };
  };
  
  transactionFeeRate: number;
  
  commerceGrowthRate?: {
    electronics?: number;
    other?: number;
    cap?: number; // 上限金额
  };
  
  // 固定费用 (本地货币)
  infrastructureFee?: number; // 平台基础设施费
  orderProcessingFee?: number; // 订单处理费
  
  // 订单处理费豁免政策
  orderProcessingFeeWaiver?: {
    newSeller: boolean; // 新卖家是否免费
    newSellerDays: number; // 新卖家免费天数
    existingSeller: boolean; // 老卖家是否有免费额度
    existingSellerFreeOrders: number; // 老卖家每月免费订单数
  };
  
  // 税费
  vatRate: number;
  vatName: string; // VAT/GST/SST名称
  dutyRateRange: [number, number];
  
  // 新商家政策
  newSellerBenefit?: string;
  
  // 特殊说明
  specialFeatures?: string[];
  
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
    specialFeatures: [
      '电商增长服务费单件上限199泰铢',
      '平台基础设施费按订单固定收取',
    ],
    notes: [
      '2024年4月起交易手续费调整为3.21%',
      '电商增长服务费和平台佣金分开计算',
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
      '存在订单处理手续费但金额未明确',
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
    orderProcessingFee: 3, // 本地卖家优惠价，原价5比索
    orderProcessingFeeWaiver: {
      newSeller: true,
      newSellerDays: 90,
      existingSeller: true,
      existingSellerFreeOrders: 50,
    },
    vatRate: 0.12,
    vatName: 'VAT',
    dutyRateRange: [0, 0.30],
    newSellerBenefit: '新卖家(90天内)订单处理费全免，老卖家每月前50单免收',
    specialFeatures: [
      '订单处理费₱3/订单(本地卖家优惠价)',
      '订单处理费不论订单金额和商品数量',
      '即使订单退款，订单处理费也不退还(除非未成功配送)',
    ],
    notes: [
      '2025年1月15日起按子类目收取5%-9.1%佣金',
      '2025年12月1日起收取订单处理费',
      'Mall商家和Marketplace商家佣金不同',
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
      range: [0.054, 0.1026], // BXP卖家范围
      bxp: {
        range: [0.0918, 0.1458], // 非BXP卖家范围 (比BXP高4%)
      },
    },
    transactionFeeRate: 0.0378,
    vatRate: 0.08,
    vatName: 'SST',
    dutyRateRange: [0, 0.30],
    newSellerBenefit: '入驻起90天直接免佣，无需完成任务',
    specialFeatures: [
      '区分BXP和非BXP卖家，费率差异4%',
      'BXP卖家享受更低佣金+平台额外支持',
      'SST税已包含在佣金和交易手续费中',
    ],
    notes: [
      '2025年9月13日起非BXP商家佣金+4%',
      '按子类目收取佣金',
      'BXP卖家可获叠加折扣券、返现、平台曝光',
      '交易手续费2024年9月5日从2.16%涨至3.78%',
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
    specialFeatures: [
      '大部分商品免关税',
      '总费率最低的东南亚市场',
    ],
    notes: [
      '2025年7月15日起固定佣金3.27%',
      '2024年1月1日起征收低价值商品税',
      'GST税率9%',
    ],
  },
};

export const COUNTRY_LIST = Object.values(COUNTRIES);

export function getCountryConfig(code: string): CountryConfig | undefined {
  return COUNTRIES[code];
}

export function getCommissionRate(
  countryCode: string,
  category: 'electronics' | 'other',
  isBXP: boolean = true // 马来西亚专用参数
): number {
  const config = COUNTRIES[countryCode];
  if (!config) return 0;
  
  // 马来西亚特殊处理
  if (countryCode === 'MY' && !isBXP && config.commissionRate.bxp) {
    if (config.commissionRate.bxp.range) {
      const [min, max] = config.commissionRate.bxp.range;
      return (min + max) / 2;
    }
  }
  
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

export function getOrderProcessingFee(
  countryCode: string,
  isNewSeller: boolean = false,
  monthlyOrderCount: number = 0
): number {
  const config = COUNTRIES[countryCode];
  if (!config || !config.orderProcessingFee) return 0;
  
  // 检查豁免政策
  if (config.orderProcessingFeeWaiver) {
    const waiver = config.orderProcessingFeeWaiver;
    
    // 新卖家豁免
    if (isNewSeller && waiver.newSeller) {
      return 0;
    }
    
    // 老卖家月度免费额度
    if (!isNewSeller && waiver.existingSeller && monthlyOrderCount <= waiver.existingSellerFreeOrders) {
      return 0;
    }
  }
  
  return config.orderProcessingFee;
}
