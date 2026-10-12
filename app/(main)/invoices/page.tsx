"use client";

import { useState, useMemo } from "react";
import { Plus, Search, ReceiptText, Check, X, ShieldAlert, AlertCircle, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

export default function InvoicesPage() {
  const { invoices, addInvoice, deleteInvoice, toggleInvoicePaid, rooms, services, currentHostel } = useHostel();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Bank settings states loaded on mount to prevent hydration mismatch
  // Dialog State
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filter rooms & services of active hostel
  const hostelRooms = rooms.filter((r) => r.hostelId === currentHostel);
  const activeHostelRooms = hostelRooms.filter((r) => r.status === "rented");

  // Query service rates dynamically from context services
  const elecService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Điện")) || { price: 3000 };
  const waterService = services.find((s) => s.hostelId === currentHostel && s.name.includes("Nước")) || { price: 5000 };
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

  const selectedRoomNum = formRoomNum && activeHostelRooms.some((r) => r.number === formRoomNum)
    ? formRoomNum
    : (activeHostelRooms[0]?.number ?? "");

  const selectedRoomDetails = hostelRooms.find((r) => r.number === selectedRoomNum) || activeHostelRooms[0];
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
    if (!selectedRoomNum) return;

    addInvoice({
      roomNumber: selectedRoomNum,
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

  const getBankSettings = () => ({
    bankId: localStorage.getItem("bankId") || "VCB",
    accountNo: localStorage.getItem("accountNo") || "0123456789",
    accountName: localStorage.getItem("accountName") || "NGUYEN VAN A",
    bankTemplate: localStorage.getItem("bankTemplate") || "compact2",
  });

  const getVietQRUrl = (invoice: Invoice) => {
    const { bankId, accountNo, accountName, bankTemplate } = getBankSettings();
    const amount = invoice.total;
    const addInfo = encodeURIComponent(`Thanh toan phong ${invoice.roomNumber} thang ${invoice.month}`);
    const name = encodeURIComponent(accountName);
    
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${bankTemplate}.png?amount=${amount}&addInfo=${addInfo}&accountName=${name}`;
  };

  const handlePrint = async (invoice: Invoice) => {
    interface UsageDetail {
      month: string;
      electricityStart: number;
      electricityEnd: number;
      waterStart: number;
      waterEnd: number;
    }
    // Tìm phòng và lấy chỉ số điện nước thực tế
    const { bankId, accountNo, accountName } = getBankSettings();
    const room = rooms.find((r) => r.number === invoice.roomNumber && r.hostelId === currentHostel);
    let usage: UsageDetail | null = null;
    if (room) {
      try {
        const res = await fetch(`/api/rooms/${room.id}/usages`);
        if (res.ok) {
          const usages: UsageDetail[] = await res.json();
          usage = usages.find((u) => u.month === invoice.month) ?? null;
        }
      } catch (e) {
        console.error("Failed to fetch usage details", e);
      }
    }

    const qrUrl = getVietQRUrl(invoice);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở cửa sổ bật lên để in hóa đơn.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Hóa đơn phòng ${invoice.roomNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1c1917; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; }
            .title { font-size: 22px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .subtitle { font-size: 13px; color: #78716c; margin-top: 6px; font-weight: 500; }
            .info-grid { display: flex; flex-wrap: wrap; margin-bottom: 20px; font-size: 13px; }
            .info-item { width: 50%; display: flex; flex-direction: column; margin-bottom: 12px; box-sizing: border-box; }
            .info-item span { color: #78716c; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
            .info-item strong { font-size: 14px; color: #1c1917; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            .table th, .table td { padding: 12px 10px; border-bottom: 1px solid #e7e5e4; text-align: left; }
            .table th { background: #f5f5f4; font-weight: 600; color: #444; text-transform: uppercase; font-size: 11px; }
            .total-row { font-size: 15px; font-weight: 700; background: #fafaf9; }
            .qr-container { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 30px; border: 1px solid #e7e5e4; padding: 16px; border-radius: 12px; background: #fafaf9; }
            .qr-info { font-size: 13px; max-width: 60%; }
            .qr-info p { margin: 0 0 4px 0; }
            .qr-image { text-align: right; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; }
            .signature-box { text-align: center; width: 45%; }
            .signature-space { height: 70px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Hóa đơn thanh toán</div>
            <div class="subtitle">Nhà trọ ${currentHostel}</div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span>Mã hóa đơn</span>
              <strong>#HD-${invoice.id}</strong>
            </div>
            <div class="info-item">
              <span>Kỳ thanh toán</span>
              <strong>Tháng ${invoice.month}</strong>
            </div>
            <div class="info-item">
              <span>Phòng</span>
              <strong>Phòng ${invoice.roomNumber}</strong>
            </div>
            <div class="info-item">
              <span>Khách thuê</span>
              <strong>${invoice.tenantName}</strong>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Khoản mục</th>
                <th style="text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tiền phòng cơ bản</td>
                <td style="text-align: right;">${formatPrice(invoice.roomPrice)}</td>
              </tr>
              <tr>
                <td>
                  Tiền điện tiêu thụ
                  ${usage ? `<br/><span style="font-size: 11px; color: #78716c;">Tiêu thụ: ${usage.electricityEnd - usage.electricityStart} kWh (Số cũ: ${usage.electricityStart} &rarr; Số mới: ${usage.electricityEnd})</span>` : ""}
                </td>
                <td style="text-align: right; vertical-align: top;">${formatPrice(invoice.electricityCost)}</td>
              </tr>
              <tr>
                <td>
                  Tiền nước tiêu thụ
                  ${usage ? `<br/><span style="font-size: 11px; color: #78716c;">Tiêu thụ: ${usage.waterEnd - usage.waterStart} m³ (Số cũ: ${usage.waterStart} &rarr; Số mới: ${usage.waterEnd})</span>` : ""}
                </td>
                <td style="text-align: right; vertical-align: top;">${formatPrice(invoice.waterCost)}</td>
              </tr>
              <tr>
                <td>Chi phí dịch vụ khác (Internet, Vệ sinh...)</td>
                <td style="text-align: right; vertical-align: top;">${formatPrice(invoice.otherServicesCost)}</td>
              </tr>
              <tr class="total-row">
                <td>TỔNG CỘNG</td>
                <td style="text-align: right; color: #000; vertical-align: middle;">${formatPrice(invoice.total)}</td>
              </tr>
            </tbody>
          </table>

          <!-- VietQR Section -->
          <div class="qr-container">
            <div class="qr-info">
              <p style="margin: 0 0 6px 0; font-weight: bold; text-transform: uppercase; font-size: 11px; color: #78716c;">Thông tin thanh toán chuyển khoản</p>
              <p>Ngân hàng: <strong>${bankId}</strong></p>
              <p>Số tài khoản: <strong>${accountNo}</strong></p>
              <p>Chủ tài khoản: <strong>${accountName}</strong></p>
              <p style="margin-top: 6px; font-size: 12px; color: #6b7280; font-style: italic;">
                Nội dung CK: <strong style="color: #111827; font-style: normal;">Thanh toan phong ${invoice.roomNumber} thang ${invoice.month}</strong>
              </p>
            </div>
            <div class="qr-image">
              <img src="${qrUrl}" alt="Mã VietQR Thanh toán" style="width: 130px; height: 130px; object-fit: contain;" />
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <p>Khách thuê ký tên</p>
              <div class="signature-space"></div>
              <div style="border-top: 1px dotted #a8a29e; width: 140px; margin: 0 auto;"></div>
            </div>
            <div class="signature-box">
              <p>Chủ trọ ký tên</p>
              <div class="signature-space"></div>
              <div style="border-top: 1px dotted #a8a29e; width: 140px; margin: 0 auto;"></div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

  // Group invoices by room for a compact overview
  const groupedInvoices = useMemo(() => {
    const map = new Map<string, Invoice[]>();
    filteredInvoices.forEach((inv) => {
      const list = map.get(inv.roomNumber) ?? [];
      list.push(inv);
      map.set(inv.roomNumber, list);
    });
    return [...map.entries()]
      .map(([roomNumber, list]) => {
        const sorted = [...list].sort((a, b) => b.month.localeCompare(a.month));
        const unpaid = sorted.filter((i) => i.status === "unpaid");
        return {
          roomNumber,
          tenantName: sorted[0]?.tenantName ?? "Không xác định",
          invoices: sorted,
          unpaidCount: unpaid.length,
          unpaidTotal: unpaid.reduce((sum, i) => sum + i.total, 0),
        };
      })
      .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
  }, [filteredInvoices]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full 2xl:max-w-6xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Tính Tiền & Hóa Đơn - Nhà trọ {currentHostel}</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Lập hóa đơn hàng tháng tự động tính toán tiền điện nước và dịch vụ đi kèm.</p>
        </div>

        <Dialog open={isOpenAdd} onOpenChange={setIsOpenAdd}>
          <DialogTrigger asChild>
              <Button
                disabled={activeHostelRooms.length === 0}
                size="sm"
                className="text-xs gap-1.5 w-full sm:w-auto"
              >
              <Plus className="w-4 h-4" /> Lập hóa đơn mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Công cụ tính tiền & Lập hóa đơn (Nhà trọ {currentHostel})</DialogTitle>
              <DialogDescription className="text-xs">
                Chọn phòng đã thuê và nhập số điện, nước tháng này để hệ thống tự động tính toán tổng hóa đơn.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4 py-2">
              {/* Step 1: Chọn phòng & Tháng */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="roomNum" className="text-xs font-medium">Chọn Phòng Thuê</Label>
                  <NativeSelect id="roomNum" value={selectedRoomNum} onChange={(e) => setFormRoomNum(e.target.value)}>
                    {activeHostelRooms.map((r) => (
                      <option key={r.number} value={r.number}>Phòng {r.number} ({r.tenantName})</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="month" className="text-xs font-medium">Tháng tính tiền</Label>
                  <Input id="month" type="month" value={formMonth} onChange={(e) => setFormMonth(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Giá phòng cơ bản</Label>
                  <div className="h-9 flex items-center px-3 border rounded-lg bg-muted text-xs font-semibold">
                    {formatPrice(roomPrice)}
                  </div>
                </div>
              </div>

              {/* Step 2: Nhập số Điện Nước */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 rounded-lg bg-muted border">
                {/* Electricity Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold border-b pb-1">Chỉ số Điện ({formatPrice(elecRate)}/kWh)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="elecOld" className="text-[10px] font-medium">Số cũ (kWh)</Label>
                      <Input id="elecOld" type="number" value={elecOld} onChange={(e) => setElecOld(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="elecNew" className="text-[10px] font-medium">Số mới (kWh)</Label>
                      <Input id="elecNew" type="number" value={elecNew} onChange={(e) => setElecNew(e.target.value)} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium pt-1">
                    Tiêu thụ: <span className="text-foreground font-semibold">{calculatedElecUnits} kWh</span> = <span className="text-foreground font-bold">{formatPrice(calculatedElecCost)}</span>
                  </div>
                </div>

                {/* Water Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold border-b pb-1">Chỉ số Nước ({formatPrice(waterRate)}/m³)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="waterOld" className="text-[10px] font-medium">Số cũ (m³)</Label>
                      <Input id="waterOld" type="number" value={waterOld} onChange={(e) => setWaterOld(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="waterNew" className="text-[10px] font-medium">Số mới (m³)</Label>
                      <Input id="waterNew" type="number" value={waterNew} onChange={(e) => setWaterNew(e.target.value)} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium pt-1">
                    Tiêu thụ: <span className="text-foreground font-semibold">{calculatedWaterUnits} m³</span> = <span className="text-foreground font-bold">{formatPrice(calculatedWaterCost)}</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Dịch vụ cố định */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold">Các tiện ích cộng thêm (Thiết lập tại Đơn giá)</h4>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                  <label className="flex items-center gap-2 text-xs cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={internetActive}
                      onChange={(e) => setInternetActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-foreground"
                    />
                    Internet ({formatPrice(internetRate)}/tháng)
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={cleaningActive}
                      onChange={(e) => setCleaningActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-foreground"
                    />
                    Vệ sinh & Rác ({formatPrice(cleaningRate)}/tháng)
                  </label>
                </div>
              </div>

              {/* Total Calculation Display */}
              <Card className="bg-foreground text-background border-0 overflow-hidden shadow-sm">
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="text-[10px] text-background/60 font-medium tracking-wider">TỔNG HÓA ĐƠN THÁNG {formMonth}</p>
                    <p className="text-lg font-bold tracking-tight mt-0.5">{formatPrice(calculatedTotal)}</p>
                  </div>
                  <div className="text-left sm:text-right text-[10px] text-background/70">
                    <p>Phòng: {selectedRoomNum} ({tenantName})</p>
                    <p className="mt-1">Nhấp &quot;Tạo hóa đơn&quot; để lưu ở trạng thái Chưa thanh toán</p>
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setIsOpenAdd(false)}>Hủy</Button>
                <Button type="submit" size="sm" className="text-xs">Tạo hóa đơn</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo số phòng hoặc tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>
        <div className="flex gap-2 items-center">
          {activeHostelRooms.length === 0 && (
            <p className="text-xs text-warning bg-warning-bg border border-warning-border px-3 py-1.5 rounded-lg font-semibold">
              Chưa có phòng nào được thuê!
            </p>
          )}
          <div className="w-full sm:w-48">
            <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs">
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* Invoices grouped by room */}
      <div className="space-y-4">
        {groupedInvoices.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-3">
            {groupedInvoices.map((group) => (
              <AccordionItem
                key={group.roomNumber}
                value={group.roomNumber}
                className="bg-card border rounded-xl overflow-hidden shadow-xs"
              >
                <AccordionTrigger className="flex-1 px-4 sm:px-6 py-4 hover:no-underline border-0 bg-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full pr-4 text-left">
                    {/* Left: Room badge & tenant */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground min-w-[90px] shrink-0">
                        Phòng {group.roomNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs truncate">{group.tenantName}</p>
                        <p className="text-[10px] text-muted-foreground">{group.invoices.length} hóa đơn</p>
                      </div>
                    </div>
                    {/* Right: payment summary */}
                    <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                      {group.unpaidCount > 0 ? (
                        <>
                          <Badge variant="warning" className="shrink-0">{group.unpaidCount} chưa đóng</Badge>
                          <span className="text-xs font-bold whitespace-nowrap">{formatPrice(group.unpaidTotal)}</span>
                        </>
                      ) : (
                        <Badge variant="success" className="shrink-0">Đã thanh toán hết</Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 sm:px-6 border-t bg-muted/30">
                  <div className="py-4 space-y-2.5">
                    {group.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-card p-3 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs"
                      >
                        <div className="min-w-0 sm:w-44 shrink-0">
                          <p className="text-xs font-bold">Kỳ {inv.month}</p>
                          <p className="font-mono text-[10px] text-muted-foreground break-all">#HD-{inv.id} · {formatDate(inv.createdAt)}</p>
                        </div>
                        <p className="text-sm font-bold whitespace-nowrap sm:flex-1">{formatPrice(inv.total)}</p>
                        <div className="flex items-center justify-between sm:justify-end gap-1.5">
                          <button
                            onClick={() => toggleInvoicePaid(inv.id)}
                            className="cursor-pointer focus:outline-none"
                            title="Click để thay đổi trạng thái"
                          >
                            {inv.status === "paid" ? (
                              <Badge variant="success" className="flex items-center gap-1 w-fit">
                                <Check className="w-3 h-3" /> Đã đóng
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="flex items-center gap-1 w-fit">
                                <X className="w-3 h-3" /> Chưa đóng
                              </Badge>
                            )}
                          </button>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => openDetail(inv)}
                              title="Xem chi tiết"
                              aria-label={`Xem chi tiết hóa đơn phòng ${inv.roomNumber}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handlePrint(inv)}
                              title="In hóa đơn"
                              aria-label={`In hóa đơn phòng ${inv.roomNumber}`}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteInvoice(inv.id)}
                              title="Xóa hóa đơn"
                              aria-label={`Xóa hóa đơn phòng ${inv.roomNumber}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="bg-card rounded-xl border shadow-xs py-12 text-center space-y-2">
            <ShieldAlert className="w-6 h-6 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground text-xs">Không tìm thấy hóa đơn nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Dialog / Receipt print view */}
      <Dialog open={isOpenDetail} onOpenChange={setIsOpenDetail}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ReceiptText className="w-5 h-5" /> Chi tiết Hóa đơn thanh toán
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-2 border-t pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Mã hóa đơn:</span>
                <span className="font-mono font-semibold">#HD-{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Kỳ thanh toán:</span>
                <span className="font-semibold">{selectedInvoice.month}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Phòng / Khách thuê:</span>
                <span className="font-semibold">P. {selectedInvoice.roomNumber} - {selectedInvoice.tenantName}</span>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2.5 border-y py-3.5 text-xs">
                <h4 className="font-semibold text-[11px] uppercase tracking-wider">Chi tiết các khoản tính</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền phòng cơ bản:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.roomPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền điện tiêu thụ:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.electricityCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền nước tiêu thụ:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.waterCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Internet & Vệ sinh:</span>
                  <span className="font-semibold">{formatPrice(selectedInvoice.otherServicesCost)}</span>
                </div>
              </div>

              {/* Summary and Paid indicator */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">TỔNG CỘNG</p>
                  <p className="text-lg font-black leading-none mt-1">{formatPrice(selectedInvoice.total)}</p>
                </div>
                <div>
                  {selectedInvoice.status === "paid" ? (
                    <Badge variant="success">Đã thanh toán</Badge>
                  ) : (
                    <Badge variant="danger">Chưa đóng tiền</Badge>
                  )}
                </div>
              </div>

              {/* Warning/Alert for unpaid invoice */}
              {selectedInvoice.status === "unpaid" && (
                <>
                  <div className="p-3 bg-warning-bg rounded-lg border border-warning-border flex items-start gap-2.5 text-[11px] text-warning">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Hóa đơn này chưa đóng tiền phòng. Bạn có thể nhấn trực tiếp vào trạng thái ở danh sách bên ngoài để chuyển thành đã thanh toán sau khi nhận được tiền mặt hoặc chuyển khoản.</p>
                  </div>
                  
                  {/* VietQR payment image in UI if unpaid */}
                  {/* <div className="flex flex-col items-center justify-center p-3.5 border rounded-lg bg-muted/50 space-y-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Mã QR Thanh toán (Chuyển khoản nhanh)</span>
                    <img
                      src={getVietQRUrl(selectedInvoice)}
                      alt="Mã VietQR thanh toán"
                      className="w-44 h-44 object-contain rounded-md bg-white border p-1 shadow-sm"
                    />
                    <p className="text-[10px] text-muted-foreground text-center font-medium">
                      Quét mã để chuyển nhanh <span className="font-bold text-foreground">{formatPrice(selectedInvoice.total)}</span>
                    </p>
                  </div> */}
                </>
              )}
            </div>
          )}
          <DialogFooter className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => selectedInvoice && handlePrint(selectedInvoice)}
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> In hóa đơn
            </Button>
            <Button size="sm" className="flex-1 text-xs" onClick={() => setIsOpenDetail(false)}>Đóng lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
