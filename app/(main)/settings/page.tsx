"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Check, Plus, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHostel } from "@/context/HostelContext";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { services, editService, addService, deleteService, toggleServiceStatus, currentHostel } = useHostel();
  
  // Bank configuration states
  const [bankId, setBankId] = useState("VCB");
  const [accountNo, setAccountNo] = useState("0123456789");
  const [accountName, setAccountName] = useState("NGUYEN VAN A");
  const [bankTemplate, setBankTemplate] = useState("compact2");
  const [isSavedBank, setIsSavedBank] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBankId(localStorage.getItem("bankId") || "VCB");
      setAccountNo(localStorage.getItem("accountNo") || "0123456789");
      setAccountName(localStorage.getItem("accountName") || "NGUYEN VAN A");
      setBankTemplate(localStorage.getItem("bankTemplate") || "compact2");
    }
  }, []);

  const handleSaveBank = () => {
    localStorage.setItem("bankId", bankId);
    localStorage.setItem("accountNo", accountNo);
    localStorage.setItem("accountName", accountName);
    localStorage.setItem("bankTemplate", bankTemplate);
    setIsSavedBank(true);
    setTimeout(() => setIsSavedBank(false), 2000);
  };

  // Find electricity and water services dynamically
  const elecService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Điện"));
  const waterService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Nước"));
  
  // Find other services
  const otherServices = services.filter(
    (s) => s.hostelId === currentHostel && !s.name.includes("Điện") && !s.name.includes("Nước")
  );

  // Local state for instant inputs editing
  const [elecPrice, setElecPrice] = useState(elecService?.price.toString() || "3000");
  const [waterPrice, setWaterPrice] = useState(waterService?.price.toString() || "5000");

  const [isSavedElec, setIsSavedElec] = useState(false);
  const [isSavedWater, setIsSavedWater] = useState(false);

  // Dialog State
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formUnit, setFormUnit] = useState("tháng/phòng");
  const [formDesc, setFormDesc] = useState("");

  const handleSaveElec = () => {
    if (elecService) {
      editService(elecService.id, { price: Number(elecPrice) });
      setIsSavedElec(true);
      setTimeout(() => setIsSavedElec(false), 2000);
    }
  };

  const handleSaveWater = () => {
    if (waterService) {
      editService(waterService.id, { price: Number(waterPrice) });
      setIsSavedWater(true);
      setTimeout(() => setIsSavedWater(false), 2000);
    }
  };

  const handleAddCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    addService({
      name: formName,
      price: Number(formPrice),
      unit: formUnit,
      status: "active",
      description: formDesc,
    });

    setFormName("");
    setFormPrice("");
    setFormUnit("tháng/phòng");
    setFormDesc("");
    setIsOpenAdd(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Cấu hình Đơn giá - Nhà trọ {currentHostel}</h2>
        <p className="text-muted-foreground text-xs mt-0.5">Thiết lập biểu giá dịch vụ tiêu thụ (điện, nước) và dịch vụ cố định hàng tháng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Electricity Settings */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-semibold">Đơn giá Điện tiêu thụ</CardTitle>
                <CardDescription className="text-[11px]">Được áp dụng khi tính chỉ số điện hàng tháng.</CardDescription>
              </div>
              <Badge variant="warning">Điện năng</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="elec-rate" className="text-xs font-semibold">Đơn giá (VND / kWh)</Label>
              <div className="flex gap-2">
                <Input
                  id="elec-rate"
                  type="number"
                  value={elecPrice}
                  onChange={(e) => setElecPrice(e.target.value)}
                  className="text-sm font-semibold"
                />
                <Button
                  onClick={handleSaveElec}
                  size="sm"
                  className="text-xs px-4 gap-1.5"
                >
                  {isSavedElec ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isSavedElec ? "Đã lưu" : "Lưu lại"}
                </Button>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg border text-[11px] text-muted-foreground italic">
              * Đơn giá áp dụng cho chỉ số điện tiêu thụ hằng tháng của Nhà trọ {currentHostel}.
            </div>
          </CardContent>
        </Card>

        {/* Water Settings */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-semibold">Đơn giá Nước sinh hoạt</CardTitle>
                <CardDescription className="text-[11px]">Được áp dụng khi tính khối lượng nước tiêu thụ.</CardDescription>
              </div>
              <Badge variant="info">Nước sạch</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="water-rate" className="text-xs font-semibold">Đơn giá (VND / m³)</Label>
              <div className="flex gap-2">
                <Input
                  id="water-rate"
                  type="number"
                  value={waterPrice}
                  onChange={(e) => setWaterPrice(e.target.value)}
                  className="text-sm font-semibold"
                />
                <Button
                  onClick={handleSaveWater}
                  size="sm"
                  className="text-xs px-4 gap-1.5"
                >
                  {isSavedWater ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isSavedWater ? "Đã lưu" : "Lưu lại"}
                </Button>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg border text-[11px] text-muted-foreground italic">
              * Đơn giá áp dụng cho khối lượng nước tiêu thụ hằng tháng của Nhà trọ {currentHostel}.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Services Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/50 pb-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Các phí dịch vụ đi kèm cố định</CardTitle>
              <CardDescription className="text-[11px]">Các khoản thu phát sinh hàng tháng theo phòng/người (Wifi, Vệ sinh, Gửi xe...)</CardDescription>
            </div>
          </div>

          <Dialog open={isOpenAdd} onOpenChange={setIsOpenAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs gap-1.5 w-full sm:w-auto">
                <Plus className="w-3.5 h-3.5" /> Thêm phí dịch vụ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Tạo phí dịch vụ phụ trợ mới</DialogTitle>
                <DialogDescription className="text-xs">Cấu hình đơn giá cho các tiện ích phụ trợ của Nhà trọ {currentHostel}.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomService} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="service-name" className="text-xs font-medium">Tên khoản thu</Label>
                  <Input id="service-name" placeholder="Ví dụ: Phí gửi xe máy" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="service-price" className="text-xs font-medium">Đơn giá (VND)</Label>
                    <Input id="service-price" type="number" placeholder="100000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="service-unit" className="text-xs font-medium">Hình thức thu</Label>
                    <NativeSelect id="service-unit" value={formUnit} onChange={(e) => setFormUnit(e.target.value)}>
                      <option value="tháng/phòng">Tháng / Phòng</option>
                      <option value="tháng/người">Tháng / Người</option>
                      <option value="lần">Theo lượt sử dụng</option>
                    </NativeSelect>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="service-desc" className="text-xs font-medium">Mô tả thêm</Label>
                  <Input id="service-desc" placeholder="Phương thức bảo dưỡng hoặc tần suất..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setIsOpenAdd(false)}>Hủy</Button>
                  <Button type="submit" size="sm" className="text-xs">Lưu lại</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[620px]">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-xs font-semibold py-3.5 pl-6">Khoản thu</TableHead>
                <TableHead className="text-xs font-semibold py-3.5">Giá trị</TableHead>
                <TableHead className="text-xs font-semibold py-3.5">Hình thức tính</TableHead>
                <TableHead className="text-xs font-semibold py-3.5">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold py-3.5">Mô tả</TableHead>
                <TableHead className="text-xs font-semibold py-3.5 text-right pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-muted/50">
                  <TableCell className="py-4 pl-6 font-semibold text-xs whitespace-nowrap">{service.name}</TableCell>
                  <TableCell className="py-4 text-xs font-bold whitespace-nowrap">{formatPrice(service.price)}</TableCell>
                  <TableCell className="py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">/{service.unit}</TableCell>
                  <TableCell className="py-4">
                    <button
                      onClick={() => toggleServiceStatus(service.id)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {service.status === "active" ? (
                        <Badge variant="success">Kích hoạt</Badge>
                      ) : (
                        <Badge variant="secondary">Tạm dừng</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="py-4 text-xs text-muted-foreground italic max-w-xs truncate">{service.description || "N/A"}</TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteService(service.id)}
                      aria-label={`Xóa phí dịch vụ ${service.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* VietQR Bank Account Settings */}
      <Card className="overflow-hidden mt-6">
        <CardHeader className="border-b bg-muted/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Cấu hình Tài khoản nhận thanh toán (VietQR)</CardTitle>
              <CardDescription className="text-[11px]">Thiết lập thông tin tài khoản ngân hàng để tự động tạo mã QR chuyển khoản khi in hóa đơn.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bankId" className="text-xs font-semibold">Ngân hàng (Mã định danh)</Label>
              <Input
                id="bankId"
                placeholder="Ví dụ: VCB, MB, TCB..."
                value={bankId}
                onChange={(e) => setBankId(e.target.value.toUpperCase())}
                className="text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountNo" className="text-xs font-semibold">Số tài khoản</Label>
              <Input
                id="accountNo"
                placeholder="Nhập số tài khoản..."
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountName" className="text-xs font-semibold">Tên chủ tài khoản</Label>
              <Input
                id="accountName"
                placeholder="Ví dụ: NGUYEN VAN A"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                className="text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bankTemplate" className="text-xs font-semibold">Kiểu hiển thị QR</Label>
              <NativeSelect
                id="bankTemplate"
                value={bankTemplate}
                onChange={(e) => setBankTemplate(e.target.value)}
                className="text-xs"
              >
                <option value="compact2">Compact 2 (Đầy đủ kèm Logo ngân hàng - Khuyên dùng)</option>
                <option value="compact">Compact (Tối giản kèm Logo)</option>
                <option value="qr_only">QR Only (Chỉ có hình QR)</option>
              </NativeSelect>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t">
            <Button
              onClick={handleSaveBank}
              size="sm"
              className="text-xs px-5 gap-1.5"
            >
              {isSavedBank ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSavedBank ? "Đã lưu thành công" : "Lưu cấu hình tài khoản"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
