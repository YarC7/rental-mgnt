"use client";

import { useState } from "react";
import { Settings, Save, Sparkles, Check, HelpCircle, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHostel, Service } from "@/context/HostelContext";
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

  // Find electricity and water services dynamically
  const elecService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Điện"));
  const waterService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Nước"));
  
  // Find other services
  const otherServices = services.filter(
    (s) => s.hostelId === currentHostel && !s.name.includes("Điện") && !s.name.includes("Nước")
  );

  // Local state for instant inputs editing
  const [elecPrice, setElecPrice] = useState(elecService?.price.toString() || "3500");
  const [waterPrice, setWaterPrice] = useState(waterService?.price.toString() || "15000");

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
    <div className="p-8 w-full mx-auto space-y-6 font-sans text-stone-900">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-semibold text-stone-900">Cấu hình Đơn giá - Nhà trọ {currentHostel}</h2>
        <p className="text-stone-500 text-xs mt-0.5">Thiết lập biểu giá dịch vụ tiêu thụ (điện, nước) và dịch vụ cố định hàng tháng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Electricity Settings */}
        <Card className="bg-white border-stone-200 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-3 border-b border-stone-100 bg-stone-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-semibold text-stone-900">Đơn giá Điện tiêu thụ</CardTitle>
                <CardDescription className="text-[11px] text-stone-500">Được áp dụng khi tính chỉ số điện hàng tháng.</CardDescription>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">Điện năng</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="elec-rate" className="text-xs text-stone-700 font-semibold">Đơn giá (VND / kWh)</Label>
              <div className="flex gap-2">
                <Input
                  id="elec-rate"
                  type="number"
                  value={elecPrice}
                  onChange={(e) => setElecPrice(e.target.value)}
                  className="text-sm font-semibold text-stone-800"
                />
                <Button
                  onClick={handleSaveElec}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-4 flex gap-1.5 cursor-pointer"
                >
                  {isSavedElec ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  {isSavedElec ? "Đã lưu" : "Lưu lại"}
                </Button>
              </div>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-500 italic">
              * Giá trị mặc định ban đầu là {formatPrice(3500)}/kWh. Sau khi cập nhật, giá trị mới sẽ hiển thị tại bảng tính hóa đơn của Nhà trọ {currentHostel}.
            </div>
          </CardContent>
        </Card>

        {/* Water Settings */}
        <Card className="bg-white border-stone-200 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-3 border-b border-stone-100 bg-stone-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-semibold text-stone-900">Đơn giá Nước sinh hoạt</CardTitle>
                <CardDescription className="text-[11px] text-stone-500">Được áp dụng khi tính khối lượng nước tiêu thụ.</CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Nước sạch</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="water-rate" className="text-xs text-stone-700 font-semibold">Đơn giá (VND / m³)</Label>
              <div className="flex gap-2">
                <Input
                  id="water-rate"
                  type="number"
                  value={waterPrice}
                  onChange={(e) => setWaterPrice(e.target.value)}
                  className="text-sm font-semibold text-stone-800"
                />
                <Button
                  onClick={handleSaveWater}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-4 flex gap-1.5 cursor-pointer"
                >
                  {isSavedWater ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  {isSavedWater ? "Đã lưu" : "Lưu lại"}
                </Button>
              </div>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-500 italic">
              * Giá trị mặc định ban đầu là {formatPrice(15000)}/m³. Thay đổi này chỉ có tác dụng cho khu Nhà trọ {currentHostel}.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Services Card */}
      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-stone-100 bg-stone-50/50 pb-4 flex flex-row justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-stone-900">Các phí dịch vụ đi kèm cố định</CardTitle>
              <CardDescription className="text-[11px] text-stone-500">Các khoản thu phát sinh hàng tháng theo phòng/người (Wifi, Vệ sinh, Gửi xe...)</CardDescription>
            </div>
          </div>

          <Dialog open={isOpenAdd} onOpenChange={setIsOpenAdd}>
            <DialogTrigger asChild>
              <Button className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5 py-1.5 px-3 rounded-lg shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Thêm phí dịch vụ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-stone-900 text-base font-semibold">Tạo phí dịch vụ phụ trợ mới</DialogTitle>
                <DialogDescription className="text-stone-500 text-xs">Cấu hình đơn giá cho các tiện ích phụ trợ của Nhà trọ {currentHostel}.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomService} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="service-name" className="text-stone-700 text-xs font-medium">Tên khoản thu</Label>
                  <Input id="service-name" placeholder="Ví dụ: Phí gửi xe máy" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="service-price" className="text-stone-700 text-xs font-medium">Đơn giá (VND)</Label>
                    <Input id="service-price" type="number" placeholder="100000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="service-unit" className="text-stone-700 text-xs font-medium">Hình thức thu</Label>
                    <NativeSelect id="service-unit" value={formUnit} onChange={(e) => setFormUnit(e.target.value)}>
                      <option value="tháng/phòng">Tháng / Phòng</option>
                      <option value="tháng/người">Tháng / Người</option>
                      <option value="lần">Theo lượt sử dụng</option>
                    </NativeSelect>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="service-desc" className="text-stone-700 text-xs font-medium">Mô tả thêm</Label>
                  <Input id="service-desc" placeholder="Phương thức bảo dưỡng hoặc tần suất..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsOpenAdd(false)}>Hủy</Button>
                  <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Lưu lại</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5 pl-6">Khoản thu</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Giá trị</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Hình thức tính</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Trạng thái</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Mô tả</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5 text-right pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-stone-50/50">
                  <TableCell className="py-4 pl-6 font-semibold text-stone-900 text-xs">{service.name}</TableCell>
                  <TableCell className="py-4 text-xs font-bold text-stone-800">{formatPrice(service.price)}</TableCell>
                  <TableCell className="py-4 text-xs text-stone-500 font-medium">/{service.unit}</TableCell>
                  <TableCell className="py-4">
                    <button
                      onClick={() => toggleServiceStatus(service.id)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {service.status === "active" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">Kích hoạt</Badge>
                      ) : (
                        <Badge className="bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-100">Tạm dừng</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="py-4 text-xs text-stone-500 italic max-w-xs truncate">{service.description || "N/A"}</TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-stone-500 hover:text-rose-600"
                      onClick={() => deleteService(service.id)}
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
    </div>
  );
}
