/**
 * Design Philosophy: Modern Business Tool Aesthetic
 * - Professional, efficient, precise design language
 * - Deep blue primary color (#1e40af - #3b82f6) for trust and stability
 * - Amber accent color (#f59e0b) for key data and CTAs
 * - Two-column dashboard layout: left for inputs, right for results
 * - Real-time calculation feedback with smooth animations
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Download, Info, TrendingUp } from "lucide-react";
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
  purchaseCost: number,
  logisticsCost: number,
  category: "electronics" | "other",
  dutyRate: number,
  targetProfitRate: number,
  platformSubsidy: number,
  sellerDiscount: number
): PricingResult {
  const infrastructureFee = 1.07;
  const commissionRate = category === "electronics" ? 0.0535 : 0.0642;
  const commerceGrowthRate = category === "electronics" ? 0.0535 : 0.0642;
  const transactionFeeRate = 0.0321;
  const vatRate = 0.07;
  const commerceGrowthFeeCap = 199;
  
  const combinedTaxRate = dutyRate + (1 + dutyRate) * vatRate;
  const costBase = purchaseCost + logisticsCost;
  const taxAmount = purchaseCost * combinedTaxRate;
  const targetRevenue = costBase * (1 + targetProfitRate);
  
  let P = (targetRevenue + infrastructureFee + taxAmount + sellerDiscount * (commissionRate + commerceGrowthRate)) /
    (1 - commissionRate - commerceGrowthRate - transactionFeeRate - vatRate / 1.07);
  
  for (let i = 0; i < 10; i++) {
    const discountedPrice = P - sellerDiscount;
    const commissionFee = discountedPrice * commissionRate;
    const commerceGrowthFee = Math.min(discountedPrice * commerceGrowthRate, commerceGrowthFeeCap);
    const transactionFee = (P - sellerDiscount - platformSubsidy) * transactionFeeRate;
    const vatAmount = P / 1.07 * vatRate;
    const actualRevenue = P - commissionFee - commerceGrowthFee - transactionFee - infrastructureFee - vatAmount - taxAmount;
    
    if (Math.abs(actualRevenue - targetRevenue) < 0.01) break;
    
    const adjustment = (targetRevenue - actualRevenue) / (1 - commissionRate - commerceGrowthRate - transactionFeeRate - vatRate / 1.07);
    P += adjustment;
  }
  
  const discountedPrice = P - sellerDiscount;
  const preTaxPrice = P / 1.07;
  const commissionFee = discountedPrice * commissionRate;
  const commerceGrowthFee = Math.min(discountedPrice * commerceGrowthRate, commerceGrowthFeeCap);
  const transactionFee = (P - sellerDiscount - platformSubsidy) * transactionFeeRate;
  const vatAmount = P / 1.07 * vatRate;
  const totalPlatformFees = commissionFee + commerceGrowthFee + transactionFee + infrastructureFee;
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
  const [purchaseCost, setPurchaseCost] = useState(100);
  const [logisticsCost, setLogisticsCost] = useState(15);
  const [category, setCategory] = useState<"electronics" | "other">("other");
  const [dutyRate, setDutyRate] = useState(0.30);
  const [targetProfitRate, setTargetProfitRate] = useState(0.30);
  const [platformSubsidy, setPlatformSubsidy] = useState(0);
  const [sellerDiscount, setSellerDiscount] = useState(0);
  const [result, setResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    const calculated = calculatePricing(
      purchaseCost,
      logisticsCost,
      category,
      dutyRate,
      targetProfitRate,
      platformSubsidy,
      sellerDiscount
    );
    setResult(calculated);
  }, [purchaseCost, logisticsCost, category, dutyRate, targetProfitRate, platformSubsidy, sellerDiscount]);

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
                <h1 className="text-xl font-bold text-foreground">泰国TikTok Shop定价计算器</h1>
                <p className="text-sm text-muted-foreground">精准计算跨境电商成本与利润</p>
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
            <Card className="shadow-lg animate-fade-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  基础参数设置
                </CardTitle>
                <CardDescription>设置商品的采购成本和物流费用</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase-cost">采购成本 (泰铢)</Label>
                  <Input
                    id="purchase-cost"
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logistics-cost">物流成本 (泰铢/件)</Label>
                  <Input
                    id="logistics-cost"
                    type="number"
                    value={logisticsCost}
                    onChange={(e) => setLogisticsCost(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">商品类目</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as "electronics" | "other")}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">电子产品 (佣金5.35%)</SelectItem>
                      <SelectItem value="other">其他品类 (佣金6.42%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "0.1s" }}>
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
                  <p className="text-xs text-muted-foreground">常见：服装30%，电子产品10%</p>
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

            <Card className="shadow-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  补贴与折扣 (可选)
                </CardTitle>
                <CardDescription>设置平台补贴和商家折扣金额</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-subsidy">平台补贴 (泰铢)</Label>
                  <Input
                    id="platform-subsidy"
                    type="number"
                    value={platformSubsidy}
                    onChange={(e) => setPlatformSubsidy(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seller-discount">商家折扣 (泰铢)</Label>
                  <Input
                    id="seller-discount"
                    type="number"
                    value={sellerDiscount}
                    onChange={(e) => setSellerDiscount(Number(e.target.value))}
                    className="text-lg font-medium"
                  />
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
                    <CardDescription>基于您的输入参数计算得出</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">含税零售价 (买家支付)</span>
                        <span className="text-3xl font-bold text-primary">{result.retailPrice.toFixed(2)} ฿</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">税前售价</span>
                        <span className="text-xl font-semibold text-foreground">{result.preTaxPrice.toFixed(2)} ฿</span>
                      </div>
                      {(sellerDiscount > 0 || platformSubsidy > 0) && (
                        <>
                          <Separator />
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">消费者实付</span>
                            <span className="text-xl font-semibold text-accent">
                              {(result.retailPrice - platformSubsidy).toFixed(2)} ฿
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">实际利润</span>
                        <span className="text-lg font-bold text-green-600">{result.revenue.actualProfit.toFixed(2)} ฿</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">利润率</span>
                        <span className="text-lg font-bold text-green-600">{(result.revenue.profitRate * 100).toFixed(2)}%</span>
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
                        <div className="flex justify-between py-2">
                          <span className="text-sm">采购成本</span>
                          <span className="font-medium">{result.costs.purchaseCost.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm">物流成本</span>
                          <span className="font-medium">{result.costs.logisticsCost.toFixed(2)} ฿</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between py-2">
                          <span className="font-semibold">成本合计</span>
                          <span className="font-bold text-lg">{result.costs.totalCost.toFixed(2)} ฿</span>
                        </div>
                      </TabsContent>

                      <TabsContent value="taxes" className="space-y-3 mt-4">
                        <div className="flex justify-between py-2">
                          <span className="text-sm">进口关税</span>
                          <span className="font-medium">{result.taxes.importDuty.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm">进口环节VAT</span>
                          <span className="font-medium">{result.taxes.importVAT.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm">销售环节VAT</span>
                          <span className="font-medium">{result.taxes.salesVAT.toFixed(2)} ฿</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between py-2">
                          <span className="font-semibold">税费合计</span>
                          <span className="font-bold text-lg text-blue-600">{result.taxes.totalTax.toFixed(2)} ฿</span>
                        </div>
                      </TabsContent>

                      <TabsContent value="platform" className="space-y-3 mt-4">
                        <div className="flex justify-between py-2">
                          <span className="text-sm">平台佣金</span>
                          <span className="font-medium">{result.platformFees.commission.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm">电商增长服务费</span>
                          <span className="font-medium">{result.platformFees.commerceGrowth.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm">交易手续费</span>
                          <span className="font-medium">{result.platformFees.transaction.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm">平台基础设施费</span>
                          <span className="font-medium">{result.platformFees.infrastructure.toFixed(2)} ฿</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between py-2">
                          <span className="font-semibold">平台费用合计</span>
                          <span className="font-bold text-lg text-purple-600">{result.platformFees.totalFees.toFixed(2)} ฿</span>
                        </div>
                      </TabsContent>

                      <TabsContent value="revenue" className="space-y-3 mt-4">
                        <div className="flex justify-between py-2">
                          <span className="text-sm">商家实际收入</span>
                          <span className="font-medium">{result.revenue.actualRevenue.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm">总成本</span>
                          <span className="font-medium text-red-600">-{result.costs.totalCost.toFixed(2)} ฿</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between py-2">
                          <span className="font-semibold">净利润</span>
                          <span className="font-bold text-lg text-green-600">{result.revenue.actualProfit.toFixed(2)} ฿</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-semibold">利润率</span>
                          <span className="font-bold text-lg text-green-600">{(result.revenue.profitRate * 100).toFixed(2)}%</span>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <Card className="mt-8 shadow-lg animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle>费用标准说明</CardTitle>
            <CardDescription>基于TikTok Shop官方2026年1月最新政策</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary">平台费用</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 平台佣金：电子产品5.35%，其他品类6.42%</li>
                <li>• 电商增长服务费：同佣金率，上限199泰铢/件</li>
                <li>• 交易手续费：3.21%</li>
                <li>• 平台基础设施费：1.07泰铢/订单</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary">税费标准</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 增值税(VAT)：7%</li>
                <li>• 进口关税：0%-30% (根据商品类目)</li>
                <li>• 综合税率 = 关税率 + (1+关税率) × VAT率</li>
                <li>• 平台代扣代缴，自动结算</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>数据来源：TikTok Shop官方商家大学 | 更新时间：2026年1月</p>
          <p className="mt-2">本工具仅供参考，实际费用以平台结算为准</p>
        </div>
      </footer>
    </div>
  );
}
