/**
 * Design Philosophy: Modern Business Tool Aesthetic
 * - Professional, efficient, precise design language
 * - Deep blue primary color for trust and stability
 * - Amber accent color for key data and CTAs
 * - Multi-country support with dynamic fee calculation
 * - Dual currency display (local + CNY)
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { COUNTRIES, COUNTRY_LIST, getCommissionRate, getCommerceGrowthRate } from "@/lib/countryConfig";
import { Calculator, Download, Globe, Info, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface PricingResult {
  retailPrice: number;
  preTaxPrice: number;
  discountedPrice: number;
  costs: {
    purchaseCost: number;
    logisticsCost: number;
    totalCost: number;
  };
  taxes: {
    importDuty: number;
    importVAT: number;
    salesVAT: number;
    totalTax: number;
  };
  platformFees: {
    commission: number;
    commerceGrowth: number;
    transaction: number;
    infrastructure: number;
    orderProcessing: number;
    totalFees: number;
  };
  subsidyDiscount: {
    sellerDiscount: number;
    platformSubsidy: number;
  };
  revenue: {
    actualRevenue: number;
    actualProfit: number;
    profitRate: number;
  };
}

function calculatePricing(
  countryCode: string,
  purchaseCost: number,
  logisticsCost: number,
  category: "electronics" | "other",
  dutyRate: number,
  targetProfitRate: number,
  platformSubsidy: number,
  sellerDiscount: number
): PricingResult {
  const config = COUNTRIES[countryCode];
  const commissionRate = getCommissionRate(countryCode, category);
  const transactionFeeRate = config.transactionFeeRate;
  const vatRate = config.vatRate;
  const infrastructureFee = config.infrastructureFee || 0;
  const orderProcessingFee = config.orderProcessingFee || 0;
  
  const commerceGrowth = getCommerceGrowthRate(countryCode, category);
  const commerceGrowthRate = commerceGrowth.rate;
  const commerceGrowthFeeCap = commerceGrowth.cap || Infinity;
  
  const combinedTaxRate = dutyRate + (1 + dutyRate) * vatRate;
  const costBase = purchaseCost + logisticsCost;
  const taxAmount = purchaseCost * combinedTaxRate;
  const targetRevenue = costBase * (1 + targetProfitRate);
  
  let P = (targetRevenue + infrastructureFee + orderProcessingFee + taxAmount + sellerDiscount * (commissionRate + commerceGrowthRate)) /
    (1 - commissionRate - commerceGrowthRate - transactionFeeRate - vatRate / (1 + vatRate));
  
  for (let i = 0; i < 10; i++) {
    const discountedPrice = P - sellerDiscount;
    const commissionFee = discountedPrice * commissionRate;
    const commerceGrowthFee = Math.min(discountedPrice * commerceGrowthRate, commerceGrowthFeeCap);
    const transactionFee = (P - sellerDiscount - platformSubsidy) * transactionFeeRate;
    const vatAmount = P / (1 + vatRate) * vatRate;
    const actualRevenue = P - commissionFee - commerceGrowthFee - transactionFee - infrastructureFee - orderProcessingFee - vatAmount - taxAmount;
    
    if (Math.abs(actualRevenue - targetRevenue) < 0.01) break;
    
    const adjustment = (targetRevenue - actualRevenue) / (1 - commissionRate - commerceGrowthRate - transactionFeeRate - vatRate / (1 + vatRate));
    P += adjustment;
  }
  
  const discountedPrice = P - sellerDiscount;
  const preTaxPrice = P / (1 + vatRate);
  const commissionFee = discountedPrice * commissionRate;
  const commerceGrowthFee = Math.min(discountedPrice * commerceGrowthRate, commerceGrowthFeeCap);
  const transactionFee = (P - sellerDiscount - platformSubsidy) * transactionFeeRate;
  const vatAmount = P / (1 + vatRate) * vatRate;
  const totalPlatformFees = commissionFee + commerceGrowthFee + transactionFee + infrastructureFee + orderProcessingFee;
  const importDuty = purchaseCost * dutyRate;
  const importVAT = purchaseCost * (1 + dutyRate) * vatRate;
  const totalTax = taxAmount + vatAmount;
  const actualRevenue = P - totalPlatformFees - totalTax;
  const actualProfit = actualRevenue - costBase;
  const profitRate = costBase > 0 ? actualProfit / costBase : 0;
  
  return {
    retailPrice: P,
    preTaxPrice,
    discountedPrice,
    costs: {
      purchaseCost,
      logisticsCost,
      totalCost: costBase,
    },
    taxes: {
      importDuty,
      importVAT,
      salesVAT: vatAmount,
      totalTax,
    },
    platformFees: {
      commission: commissionFee,
      commerceGrowth: commerceGrowthFee,
      transaction: transactionFee,
      infrastructure: infrastructureFee,
      orderProcessing: orderProcessingFee,
      totalFees: totalPlatformFees,
    },
    subsidyDiscount: {
      sellerDiscount,
      platformSubsidy,
    },
    revenue: {
      actualRevenue,
      actualProfit,
      profitRate,
    },
  };
}

export default function Home() {
  const [countryCode, setCountryCode] = useState("TH");
  const [purchaseCostCNY, setPurchaseCostCNY] = useState(20); // 人民币输入
  const [logisticsCostCNY, setLogisticsCostCNY] = useState(5.5); // 人民币输入
  const [category, setCategory] = useState<"electronics" | "other">("other");
  const [dutyRate, setDutyRate] = useState(0.30);
  const [targetProfitRate, setTargetProfitRate] = useState(0.30);
  const [platformSubsidy, setPlatformSubsidy] = useState(0);
  const [sellerDiscount, setSellerDiscount] = useState(0);
  const [result, setResult] = useState<PricingResult | null>(null);

  const currentCountry = COUNTRIES[countryCode];
  
  // 将人民币转换为本地货币
  const purchaseCostLocal = purchaseCostCNY / currentCountry.exchangeRateToCNY;
  const logisticsCostLocal = logisticsCostCNY / currentCountry.exchangeRateToCNY;

  useEffect(() => {
    const calculated = calculatePricing(
      countryCode,
      purchaseCostLocal,
      logisticsCostLocal,
      category,
      dutyRate,
      targetProfitRate,
      platformSubsidy,
      sellerDiscount
    );
    setResult(calculated);
  }, [countryCode, purchaseCostLocal, logisticsCostLocal, category, dutyRate, targetProfitRate, platformSubsidy, sellerDiscount]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">东南亚TikTok Shop定价计算器</h1>
                <p className="text-sm text-muted-foreground">支持人民币输入 · 自动汇率转换</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Input Controls */}
          <div className="space-y-6">
            {/* Country Selection */}
            <Card className="shadow-lg animate-fade-up border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  选择目标市场
                </CardTitle>
                <CardDescription>不同国家的费率标准有所差异</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="text-lg font-medium h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_LIST.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.nameCN} ({country.name}) - {country.currencySymbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">当前汇率</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 {currentCountry.currency} = ¥{currentCountry.exchangeRateToCNY.toFixed(4)}
                  </p>
                </div>
                
                {currentCountry.newSellerBenefit && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-sm font-medium text-accent-foreground flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      新商家优惠
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{currentCountry.newSellerBenefit}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  基础参数设置
                </CardTitle>
                <CardDescription>使用人民币输入，自动转换为目标市场货币</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase-cost">采购成本 (人民币 ¥)</Label>
                  <Input
                    id="purchase-cost"
                    type="number"
                    value={purchaseCostCNY}
                    onChange={(e) => setPurchaseCostCNY(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    ≈ {currentCountry.currencySymbol}{purchaseCostLocal.toFixed(2)} {currentCountry.currency}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logistics-cost">物流成本 (人民币 ¥/件)</Label>
                  <Input
                    id="logistics-cost"
                    type="number"
                    value={logisticsCostCNY}
                    onChange={(e) => setLogisticsCostCNY(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    ≈ {currentCountry.currencySymbol}{logisticsCostLocal.toFixed(2)} {currentCountry.currency}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">商品类目</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as "electronics" | "other")}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">电子产品</SelectItem>
                      <SelectItem value="other">其他品类</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    当前佣金率：{(getCommissionRate(countryCode, category) * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  税费与利润设置
                </CardTitle>
                <CardDescription>配置关税税率和目标利润率</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duty-rate">关税税率 (%)</Label>
                  <Input
                    id="duty-rate"
                    type="number"
                    value={dutyRate * 100}
                    onChange={(e) => setDutyRate(Number(e.target.value) / 100)}
                    className="text-lg font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    {currentCountry.nameCN}关税范围：{currentCountry.dutyRateRange[0] * 100}% - {currentCountry.dutyRateRange[1] * 100}%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profit-rate">目标利润率 (%)</Label>
                  <Input
                    id="profit-rate"
                    type="number"
                    value={targetProfitRate * 100}
                    onChange={(e) => setTargetProfitRate(Number(e.target.value) / 100)}
                    className="text-lg font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  补贴与折扣 (可选)
                </CardTitle>
                <CardDescription>设置平台补贴和商家折扣金额（本地货币）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-subsidy">平台补贴 ({currentCountry.currency})</Label>
                  <Input
                    id="platform-subsidy"
                    type="number"
                    value={platformSubsidy}
                    onChange={(e) => setPlatformSubsidy(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
                  {platformSubsidy > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ≈ ¥{(platformSubsidy * currentCountry.exchangeRateToCNY).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seller-discount">商家折扣 ({currentCountry.currency})</Label>
                  <Input
                    id="seller-discount"
                    type="number"
                    value={sellerDiscount}
                    onChange={(e) => setSellerDiscount(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
                  {sellerDiscount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ≈ ¥{(sellerDiscount * currentCountry.exchangeRateToCNY).toFixed(2)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {result && (
              <>
                <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 animate-fade-up">
                  <CardHeader>
                    <CardTitle className="text-2xl">定价结果</CardTitle>
                    <CardDescription>基于{currentCountry.nameCN}市场费率计算</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">含税零售价 (买家支付)</span>
                        <CurrencyDisplay
                          amount={result.retailPrice}
                          currencySymbol={currentCountry.currencySymbol}
                          exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                          size="xl"
                          className="text-primary"
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">税前售价</span>
                        <CurrencyDisplay
                          amount={result.preTaxPrice}
                          currencySymbol={currentCountry.currencySymbol}
                          exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                          size="lg"
                        />
                      </div>
                      {(sellerDiscount > 0 || platformSubsidy > 0) && (
                        <>
                          <Separator />
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">消费者实付</span>
                            <CurrencyDisplay
                              amount={result.retailPrice - platformSubsidy}
                              currencySymbol={currentCountry.currencySymbol}
                              exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                              size="lg"
                              className="text-accent"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">实际利润</span>
                        <CurrencyDisplay
                          amount={result.revenue.actualProfit}
                          currencySymbol={currentCountry.currencySymbol}
                          exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                          size="lg"
                          className="text-green-600"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">利润率</span>
                        <span className="text-lg font-bold text-green-600">
                          {(result.revenue.profitRate * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  <CardHeader>
                    <CardTitle>费用明细</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="costs" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="costs">成本</TabsTrigger>
                        <TabsTrigger value="taxes">税费</TabsTrigger>
                        <TabsTrigger value="platform">平台</TabsTrigger>
                        <TabsTrigger value="revenue">收益</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="costs" className="space-y-3 mt-4">
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">采购成本</span>
                          <CurrencyDisplay
                            amount={result.costs.purchaseCost}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">物流成本</span>
                          <CurrencyDisplay
                            amount={result.costs.logisticsCost}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        <Separator />
                        <div className="flex justify-between py-2 items-center">
                          <span className="font-semibold">成本合计</span>
                          <CurrencyDisplay
                            amount={result.costs.totalCost}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="md"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="taxes" className="space-y-3 mt-4">
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">进口关税</span>
                          <CurrencyDisplay
                            amount={result.taxes.importDuty}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">进口环节{currentCountry.vatName}</span>
                          <CurrencyDisplay
                            amount={result.taxes.importVAT}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">销售环节{currentCountry.vatName}</span>
                          <CurrencyDisplay
                            amount={result.taxes.salesVAT}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        <Separator />
                        <div className="flex justify-between py-2 items-center">
                          <span className="font-semibold">税费合计</span>
                          <CurrencyDisplay
                            amount={result.taxes.totalTax}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="md"
                            className="text-blue-600"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {currentCountry.vatName}税率：{(currentCountry.vatRate * 100).toFixed(0)}%
                        </div>
                      </TabsContent>

                      <TabsContent value="platform" className="space-y-3 mt-4">
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">平台佣金</span>
                          <CurrencyDisplay
                            amount={result.platformFees.commission}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        {result.platformFees.commerceGrowth > 0 && (
                          <div className="flex justify-between py-2 items-center">
                            <span className="text-sm">电商增长服务费</span>
                            <CurrencyDisplay
                              amount={result.platformFees.commerceGrowth}
                              currencySymbol={currentCountry.currencySymbol}
                              exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                              size="sm"
                            />
                          </div>
                        )}
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">交易手续费</span>
                          <CurrencyDisplay
                            amount={result.platformFees.transaction}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        {result.platformFees.infrastructure > 0 && (
                          <div className="flex justify-between py-2 items-center">
                            <span className="text-sm">平台基础设施费</span>
                            <CurrencyDisplay
                              amount={result.platformFees.infrastructure}
                              currencySymbol={currentCountry.currencySymbol}
                              exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                              size="sm"
                            />
                          </div>
                        )}
                        {result.platformFees.orderProcessing > 0 && (
                          <div className="flex justify-between py-2 items-center">
                            <span className="text-sm">订单处理费</span>
                            <CurrencyDisplay
                              amount={result.platformFees.orderProcessing}
                              currencySymbol={currentCountry.currencySymbol}
                              exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                              size="sm"
                            />
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between py-2 items-center">
                          <span className="font-semibold">平台费用合计</span>
                          <CurrencyDisplay
                            amount={result.platformFees.totalFees}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="md"
                            className="text-purple-600"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="revenue" className="space-y-3 mt-4">
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">商家实际收入</span>
                          <CurrencyDisplay
                            amount={result.revenue.actualRevenue}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="sm"
                          />
                        </div>
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-sm">总成本</span>
                          <div className="flex flex-col items-end text-red-600">
                            <span className="text-sm font-bold">
                              -{currentCountry.currencySymbol}{result.costs.totalCost.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ≈ -¥{(result.costs.totalCost * currentCountry.exchangeRateToCNY).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between py-2 items-center">
                          <span className="font-semibold">净利润</span>
                          <CurrencyDisplay
                            amount={result.revenue.actualProfit}
                            currencySymbol={currentCountry.currencySymbol}
                            exchangeRateToCNY={currentCountry.exchangeRateToCNY}
                            size="md"
                            className="text-green-600"
                          />
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-semibold">利润率</span>
                          <span className="font-bold text-lg text-green-600">
                            {(result.revenue.profitRate * 100).toFixed(2)}%
                          </span>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Country-specific notes */}
                {currentCountry.notes && currentCountry.notes.length > 0 && (
                  <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
                    <CardHeader>
                      <CardTitle className="text-base">{currentCountry.nameCN}市场特别说明</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {currentCountry.notes.map((note, index) => (
                          <li key={index}>• {note}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <Card className="mt-8 shadow-lg animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle>东南亚市场费用对比</CardTitle>
            <CardDescription>基于TikTok Shop官方2026年1月最新政策</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">市场</th>
                    <th className="text-left py-3 px-4 font-semibold">平台佣金</th>
                    <th className="text-left py-3 px-4 font-semibold">交易手续费</th>
                    <th className="text-left py-3 px-4 font-semibold">税率</th>
                    <th className="text-left py-3 px-4 font-semibold">汇率</th>
                  </tr>
                </thead>
                <tbody>
                  {COUNTRY_LIST.map((country) => (
                    <tr key={country.code} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{country.nameCN}</td>
                      <td className="py-3 px-4">
                        {country.commissionRate.range
                          ? `${(country.commissionRate.range[0] * 100).toFixed(1)}% - ${(country.commissionRate.range[1] * 100).toFixed(1)}%`
                          : `${((country.commissionRate.electronics || country.commissionRate.other || 0) * 100).toFixed(2)}%`}
                      </td>
                      <td className="py-3 px-4">{(country.transactionFeeRate * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">{country.vatName} {(country.vatRate * 100).toFixed(0)}%</td>
                      <td className="py-3 px-4 text-xs">1{country.currency} = ¥{country.exchangeRateToCNY.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>数据来源：TikTok Shop官方商家大学 | 更新时间：2026年1月</p>
          <p className="mt-2">本工具仅供参考，实际费用以平台结算为准 | 汇率数据为参考值，请以实时汇率为准</p>
        </div>
      </footer>
    </div>
  );
}
