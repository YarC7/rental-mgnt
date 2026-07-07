"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ReceiptText, Check, X, ShieldAlert, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useHostel, Invoice } from "@/context/HostelContext";
import Link from "next/link";

export default function InvoicesPage() {
  const { invoices, addInvoice, deleteInvoice, toggleInvoicePaid, rooms, services, currentHostel } = useHostel();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog State
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filter rooms & services of active hostel
  const hostelRooms = rooms.filter((r) => r.hostelId === currentHostel);
  const activeHostelRooms = hostelRooms.filter((r) => r.status === "rented");

  // Query service rates dynamically from context services
  const elecService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Điện")) || { price: 3500 };
  const waterService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Nước")) || { price: 15000 };
  const internetService = services.find((s) => s.hostelId === currentHostel && (s.name.includes("Internet") || s.name.includes("Cáp quang"))) || { price: 100000 };
  const cleaningService = services.find((s) => s.hostelId === currentHostel && (s.name.includes("vệ sinh") || s.name.includes("Vệ sinh"))) || { price: 50000 };

  const elecRate = elecService.price;
  const waterRate = waterService.price;
  const internetRate = internetService.price;
  const cleaningRate = cleaningService.price;

  // Calculator Form State
  const [formRoomNum, setFormRoomNum] = useState("");
  const [formMonth, setFormMonth] = useState("2026-06");
  const [elecOld, setElecOld] = useState("120");
  const [elecNew, setElecNew] = useState("185");
  const [waterOld, setWaterOld] = useState("45");
  const [waterNew, setWaterNew] = useState("53");
  const [internetActive, setInternetActive] = useState(true);
  const [cleaningActive, setCleaningActive] = useState(true);

  // Set default room in form when active rooms change
  useEffect(() => {
    if (activeHostelRooms.length > 0) {
      setFormRoomNum(activeHostelRooms[0].number);
    } else {
      setFormRoomNum("");
    }
  }, [currentHostel, isOpenAdd]);

  const selectedRoomDetails = hostelRooms.find((r) => r.number === formRoomNum) || activeHostelRooms[0];
  const roomPrice = selectedRoomDetails?.price || 0;
  const tenantName = selectedRoomDetails?.tenantName || "Không xác định";

  const calculatedElecUnits = Math.max(0, Number(elecNew) - Number(elecOld));
  const calculatedElecCost = calculatedElecUnits * elecRate;

  const calculatedWaterUnits = Math.max(0, Number(waterNew) - Number(waterOld));
  const calculatedWaterCost = calculatedWaterUnits * waterRate;

  const otherServicesCost = (internetActive ? internetRate : 0) + (cleaningActive ? cleaningRate : 0);
  const calculatedTotal = roomPrice + calculatedElecCost + calculatedWaterCost + otherServicesCost;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoomNum) return;

    addInvoice({
      roomNumber: formRoomNum,
      tenantName: tenantName,
      month: formMonth,
      roomPrice: roomPrice,
      electricityCost: calculatedElecCost,
      waterCost: calculatedWaterCost,
      otherServicesCost: otherServicesCost,
      total: calculatedTotal,
      status: "unpaid",
    });

    setIsOpenAdd(false);
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Xóa hóa đơn này khỏi hệ thống?")) {
      deleteInvoice(id);
    }
  };

  const openDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsOpenDetail(true);
  };

  const hostelInvoices = invoices.filter((inv) => inv.hostelId === currentHostel);

  const filteredInvoices = hostelInvoices.filter((inv) => {
    const matchesSearch = inv.roomNumber.includes(searchTerm) || inv.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="p-8 w-full 2xl:max-w-6xl mx-auto space-y-6 font-sans text-stone-900">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Tính Tiền & Hóa Đơn - Nhà trọ {currentHostel}</h2>
          <p className="text-stone-500 text-xs mt-0.5">Lập hóa đơn hàng tháng tự động tính toán tiền điện nước và dịch vụ đi kèm.</p>
        </div>

        <Dialog open={isOpenAdd} onOpenChange={setIsOpenAdd}>
          <DialogTrigger asChild>
            <Button
              disabled={activeHostelRooms.length === 0}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5 py-2 px-3.5 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Lập hóa đơn mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-stone-900 text-base font-semibold">Công cụ tính tiền & Lập hóa đơn (Nhà trọ {currentHostel})</DialogTitle>
              <DialogDescription className="text-stone-500 text-xs">
                Chọn phòng đã thuê và nhập số điện, nước tháng này để hệ thống tự động tính toán tổng hóa đơn.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4 py-2 text-stone-900">
              {/* Step 1: Chọn phòng & Tháng */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="roomNum" className="text-stone-700 text-xs font-medium">Chọn Phòng Thuê</Label>
                  <NativeSelect id="roomNum" value={formRoomNum} onChange={(e) => setFormRoomNum(e.target.value)}>
                    {activeHostelRooms.map((r) => (
                      <option key={r.number} value={r.number}>Phòng {r.number} ({r.tenantName})</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="month" className="text-stone-700 text-xs font-medium">Tháng tính tiền</Label>
                  <Input id="month" type="month" value={formMonth} onChange={(e) => setFormMonth(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-stone-700 text-xs font-medium">Giá phòng cơ bản</Label>
                  <div className="h-9 flex items-center px-3 border border-stone-200 rounded-lg bg-stone-50 text-xs font-semibold">
                    {formatPrice(roomPrice)}
                  </div>
                </div>
              </div>

              {/* Step 2: Nhập số Điện Nước */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-stone-50 border border-stone-200">
                {/* Electricity Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-stone-800 border-b pb-1">Chỉ số Điện ({formatPrice(elecRate)}/kWh)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="elecOld" className="text-[10px] text-stone-600 font-medium">Số cũ (kWh)</Label>
                      <Input id="elecOld" type="number" value={elecOld} onChange={(e) => setFormRoomNum(e.target.value)} className="bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="elecNew" className="text-[10px] text-stone-600 font-medium">Số mới (kWh)</Label>
                      <Input id="elecNew" type="number" value={elecNew} onChange={(e) => setElecNew(e.target.value)} className="bg-white" />
                    </div>
                  </div>
                  <div className="text-xs text-stone-500 font-medium pt-1">
                    Tiêu thụ: <span className="text-stone-900 font-semibold">{calculatedElecUnits} kWh</span> = <span className="text-stone-900 font-bold">{formatPrice(calculatedElecCost)}</span>
                  </div>
                </div>

                {/* Water Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-stone-800 border-b pb-1">Chỉ số Nước ({formatPrice(waterRate)}/m³)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="waterOld" className="text-[10px] text-stone-600 font-medium">Số cũ (m³)</Label>
                      <Input id="waterOld" type="number" value={waterOld} onChange={(e) => setWaterOld(e.target.value)} className="bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="waterNew" className="text-[10px] text-stone-600 font-medium">Số mới (m³)</Label>
                      <Input id="waterNew" type="number" value={waterNew} onChange={(e) => setWaterNew(e.target.value)} className="bg-white" />
                    </div>
                  </div>
                  <div className="text-xs text-stone-500 font-medium pt-1">
                    Tiêu thụ: <span className="text-stone-900 font-semibold">{calculatedWaterUnits} m³</span> = <span className="text-stone-900 font-bold">{formatPrice(calculatedWaterCost)}</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Dịch vụ cố định */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-stone-800">Các tiện ích cộng thêm (Thiết lập tại Đơn giá)</h4>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={internetActive}
                      onChange={(e) => setInternetActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-stone-800"
                    />
                    Internet ({formatPrice(internetRate)}/tháng)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={cleaningActive}
                      onChange={(e) => setCleaningActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-stone-800"
                    />
                    Vệ sinh & Rác ({formatPrice(cleaningRate)}/tháng)
                  </label>
                </div>
              </div>

              {/* Total Calculation Display */}
              <Card className="bg-stone-900 text-stone-50 border-0 overflow-hidden shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-stone-400 font-medium tracking-wider">TỔNG HÓA ĐƠN THÁNG {formMonth}</p>
                    <p className="text-lg font-bold tracking-tight text-white mt-0.5">{formatPrice(calculatedTotal)}</p>
                  </div>
                  <div className="text-right text-[10px] text-stone-300">
                    <p>Phòng: {formRoomNum} ({tenantName})</p>
                    <p className="mt-1">Nhấp 'Tạo hóa đơn' để lưu ở trạng thái Chưa thanh toán</p>
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsOpenAdd(false)}>Hủy</Button>
                <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Tạo hóa đơn</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Tìm theo số phòng hoặc tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>
        <div className="flex gap-2 items-center">
          {activeHostelRooms.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg font-semibold">
              Chưa có phòng nào được thuê!
            </p>
          )}
          <div className="w-full 2xl:max-w-6xl sm:w-48">
            <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs">
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5 pl-6">Mã Hóa đơn</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Phòng / Khách thuê</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Kỳ hóa đơn</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Ngày lập</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Tổng số tiền</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Trạng thái</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5 text-right pr-6">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-stone-50/50">
                    <TableCell className="py-4 pl-6 font-mono text-xs text-stone-500 font-semibold">
                      #HD-{inv.id}
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold text-stone-900 text-xs">P. {inv.roomNumber}</p>
                        <p className="text-[10px] text-stone-500">{inv.tenantName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-xs font-semibold text-stone-700">{inv.month}</TableCell>
                    <TableCell className="py-4 text-xs text-stone-600">{inv.createdAt}</TableCell>
                    <TableCell className="py-4 text-xs font-bold text-stone-900">{formatPrice(inv.total)}</TableCell>
                    <TableCell className="py-4">
                      <button
                        onClick={() => toggleInvoicePaid(inv.id)}
                        className="cursor-pointer focus:outline-none"
                        title="Click để thay đổi trạng thái"
                      >
                        {inv.status === "paid" ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center gap-1 w-fit hover:bg-emerald-50">
                            <Check className="w-3 h-3" /> Đã đóng
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-100 flex items-center gap-1 w-fit hover:bg-rose-50">
                            <X className="w-3 h-3" /> Chưa đóng
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6 space-x-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-500 hover:text-stone-950"
                        onClick={() => openDetail(inv)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-500 hover:text-rose-600"
                        onClick={() => handleDeleteInvoice(inv.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 space-y-2">
                    <ShieldAlert className="w-6 h-6 mx-auto text-stone-400" />
                    <p className="text-stone-500 text-xs">Không tìm thấy hóa đơn nào phù hợp.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invoice Detail Dialog / Receipt print view */}
      <Dialog open={isOpenDetail} onOpenChange={setIsOpenDetail}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-stone-900 text-base font-bold flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-stone-700" /> Chi tiết Hóa đơn thanh toán
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-2 border-t pt-4 text-stone-900">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Mã hóa đơn:</span>
                <span className="font-mono font-semibold">#HD-{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Kỳ thanh toán:</span>
                <span className="font-semibold">{selectedInvoice.month}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Phòng / Khách thuê:</span>
                <span className="font-semibold">P. {selectedInvoice.roomNumber} - {selectedInvoice.tenantName}</span>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2.5 border-y py-3.5 text-xs">
                <h4 className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider">Chi tiết các khoản tính</h4>
                <div className="flex justify-between">
                  <span className="text-stone-600">Tiền phòng cơ bản:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.roomPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Tiền điện tiêu thụ:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.electricityCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Tiền nước tiêu thụ:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.waterCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Internet & Vệ sinh:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.otherServicesCost)}</span>
                </div>
              </div>

              {/* Summary and Paid indicator */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">TỔNG CỘNG</p>
                  <p className="text-lg font-black text-stone-900 leading-none mt-1">{formatPrice(selectedInvoice.total)}</p>
                </div>
                <div>
                  {selectedInvoice.status === "paid" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Đã thanh toán</Badge>
                  ) : (
                    <Badge className="bg-rose-100 text-rose-800 border-rose-200">Chưa đóng tiền</Badge>
                  )}
                </div>
              </div>

              {/* Warning/Alert for unpaid invoice */}
              {selectedInvoice.status === "unpaid" && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2.5 text-[11px] text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Hóa đơn này chưa đóng tiền phòng. Bạn có thể nhấn trực tiếp vào trạng thái ở danh sách bên ngoài để chuyển thành đã thanh toán sau khi nhận được tiền mặt hoặc chuyển khoản.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button className="w-full 2xl:max-w-6xl bg-stone-900 hover:bg-stone-800 text-white text-xs" onClick={() => setIsOpenDetail(false)}>Đóng lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
