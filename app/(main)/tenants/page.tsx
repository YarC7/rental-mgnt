"use client";

import { useState, useEffect } from "react";
import { Plus, Search, User, Edit2, Trash2, ShieldAlert } from "lucide-react";
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
import { useHostel, Tenant } from "@/context/HostelContext";

export default function TenantsPage() {
  const { tenants, addTenant, editTenant, deleteTenant, rooms, currentHostel } = useHostel();
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formIdentity, setFormIdentity] = useState("");
  const [formBirthYear, setFormBirthYear] = useState("2000");
  const [formAddress, setFormAddress] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formDeposit, setFormDeposit] = useState("");

  // Filter empty rooms of active hostel
  const hostelRooms = rooms.filter((r) => r.hostelId === currentHostel);
  const emptyRooms = hostelRooms.filter((r) => r.status === "empty").map((r) => r.number);

  useEffect(() => {
    if (emptyRooms.length > 0) {
      setFormRoom(emptyRooms[0]);
    } else {
      setFormRoom("");
    }
  }, [currentHostel, isOpenAdd]);

  const resetForm = () => {
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormIdentity("");
    setFormBirthYear("2000");
    setFormAddress("");
    setFormRoom(emptyRooms[0] || "");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormDeposit("2500000");
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formRoom) return;

    addTenant({
      name: formName,
      phone: formPhone,
      email: formEmail || "N/A",
      identityCard: formIdentity || "N/A",
      birthYear: formBirthYear,
      permanentAddress: formAddress || "N/A",
      roomNumber: formRoom,
      startDate: formStartDate || new Date().toISOString().split("T")[0],
      deposit: Number(formDeposit) || 0,
    });

    resetForm();
    setIsOpenAdd(false);
  };

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormName(tenant.name);
    setFormPhone(tenant.phone);
    setFormEmail(tenant.email);
    setFormIdentity(tenant.identityCard);
    setFormBirthYear(tenant.birthYear);
    setFormAddress(tenant.permanentAddress);
    setFormRoom(tenant.roomNumber);
    setFormStartDate(tenant.startDate);
    setFormDeposit(tenant.deposit.toString());
    setIsOpenEdit(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !formName || !formPhone) return;

    editTenant(selectedTenant.id, {
      name: formName,
      phone: formPhone,
      email: formEmail,
      identityCard: formIdentity,
      birthYear: formBirthYear,
      permanentAddress: formAddress,
      roomNumber: formRoom,
      startDate: formStartDate,
      deposit: Number(formDeposit),
    });

    setIsOpenEdit(false);
    setSelectedTenant(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa hoàn toàn hồ sơ khách thuê này khỏi danh sách?")) {
      deleteTenant(id);
    }
  };

  const hostelTenants = tenants.filter((t) => t.hostelId === currentHostel);

  const filteredTenants = hostelTenants.filter((tenant) => {
    const term = searchTerm.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(term) ||
      tenant.phone.includes(term) ||
      tenant.roomNumber.includes(term)
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="p-8 w-full 2xl:max-w-6xl mx-auto space-y-6 font-sans text-stone-900">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Danh sách Khách thuê - Nhà trọ {currentHostel}</h2>
          <p className="text-stone-500 text-xs mt-0.5">Quản lý hồ sơ lý lịch khách đang thuê trọ và thông tin đặt cọc phòng.</p>
        </div>

        <Dialog open={isOpenAdd} onOpenChange={(open) => { setIsOpenAdd(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button disabled={emptyRooms.length === 0} className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5 py-2 px-3.5 rounded-lg shadow-sm disabled:opacity-50">
              <Plus className="w-4 h-4" /> Đăng ký khách thuê
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-stone-900 text-base font-semibold">Đăng ký khách thuê mới (Nhà trọ {currentHostel})</DialogTitle>
              <DialogDescription className="text-stone-500 text-xs">Lập hồ sơ khách thuê trọ và phân phối vào phòng trống.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="space-y-3.5 py-1.5 text-stone-900">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-[11px] text-stone-600 font-semibold">Họ và tên khách</Label>
                <Input id="name" placeholder="Nguyễn Văn A" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-[11px] text-stone-600 font-semibold">Số điện thoại</Label>
                  <Input id="phone" placeholder="09xxxxxxxx" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="birthYear" className="text-[11px] text-stone-600 font-semibold">Năm sinh</Label>
                  <Input id="birthYear" type="number" placeholder="2000" value={formBirthYear} onChange={(e) => setFormBirthYear(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="identity" className="text-[11px] text-stone-600 font-semibold">Số CCCD / Hộ chiếu</Label>
                  <Input id="identity" placeholder="001099xxxxxx" value={formIdentity} onChange={(e) => setFormIdentity(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-[11px] text-stone-600 font-semibold">Địa chỉ thường trú</Label>
                  <Input id="address" placeholder="Thành phố, Tỉnh" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-[11px] text-stone-600 font-semibold">Địa chỉ Email</Label>
                <Input id="email" type="email" placeholder="example@gmail.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div className="space-y-1">
                  <Label htmlFor="room" className="text-[11px] text-stone-600 font-semibold">Phòng trống bàn giao</Label>
                  <NativeSelect id="room" value={formRoom} onChange={(e) => setFormRoom(e.target.value)}>
                    {emptyRooms.map((num) => (
                      <option key={num} value={num}>Phòng {num}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="startDate" className="text-[11px] text-stone-600 font-semibold">Ngày nhận phòng</Label>
                  <Input id="startDate" type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="deposit" className="text-[11px] text-stone-600 font-semibold">Tiền đặt cọc phòng (VND)</Label>
                <Input id="deposit" type="number" placeholder="2500000" value={formDeposit} onChange={(e) => setFormDeposit(e.target.value)} required />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsOpenAdd(false)}>Hủy</Button>
                <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Đăng ký & Bàn giao</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex bg-white p-4 rounded-xl border border-stone-200 shadow-sm gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Tìm kiếm khách thuê theo tên, SĐT hoặc số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>
      </div>

      {/* List Tenants in Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5 pl-6">Khách thuê</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Năm sinh</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Phòng</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Số CCCD</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Địa chỉ thường trú</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Ngày nhận phòng</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5">Tiền đặt cọc</TableHead>
                <TableHead className="text-stone-700 text-xs font-semibold py-3.5 text-right pr-6">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="hover:bg-stone-50/50">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900 text-xs">{tenant.name}</p>
                          <p className="text-[10px] text-stone-500">{tenant.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-xs text-stone-600">{tenant.birthYear}</TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800">
                        P. {tenant.roomNumber}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-xs text-stone-500 font-mono">{tenant.identityCard}</TableCell>
                    <TableCell className="py-4 text-xs text-stone-600 italic max-w-xs truncate" title={tenant.permanentAddress}>
                      {tenant.permanentAddress}
                    </TableCell>
                    <TableCell className="py-4 text-xs text-stone-600">{tenant.startDate}</TableCell>
                    <TableCell className="py-4 text-xs font-semibold text-stone-900">{formatPrice(tenant.deposit)}</TableCell>
                    <TableCell className="py-4 text-right pr-6 space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-500 hover:text-stone-950"
                        onClick={() => openEditDialog(tenant)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-500 hover:text-rose-600"
                        onClick={() => handleDelete(tenant.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 space-y-2">
                    <ShieldAlert className="w-6 h-6 mx-auto text-stone-400" />
                    <p className="text-stone-500 text-xs">Không có thông tin khách thuê phù hợp.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Tenant Dialog */}
      <Dialog open={isOpenEdit} onOpenChange={(open) => { setIsOpenEdit(open); if (!open) { setSelectedTenant(null); resetForm(); } }}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-stone-900 text-base font-semibold">Chỉnh sửa hồ sơ khách thuê</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-3.5 py-1.5 text-stone-900">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-[11px] text-stone-600 font-semibold">Họ và tên khách</Label>
              <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-[11px] text-stone-600 font-semibold">Số điện thoại</Label>
                <Input id="edit-phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-birthYear" className="text-[11px] text-stone-600 font-semibold">Năm sinh</Label>
                <Input id="edit-birthYear" type="number" value={formBirthYear} onChange={(e) => setFormBirthYear(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-identity" className="text-[11px] text-stone-600 font-semibold">Số CCCD / CMND</Label>
                <Input id="edit-identity" value={formIdentity} onChange={(e) => setFormIdentity(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-address" className="text-[11px] text-stone-600 font-semibold">Địa chỉ thường trú</Label>
                <Input id="edit-address" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email" className="text-[11px] text-stone-600 font-semibold">Địa chỉ Email</Label>
              <Input id="edit-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div className="space-y-1">
                <Label htmlFor="edit-room" className="text-[11px] text-stone-600 font-semibold">Số phòng</Label>
                <NativeSelect id="edit-room" value={formRoom} onChange={(e) => setFormRoom(e.target.value)}>
                  <option value={selectedTenant?.roomNumber}>{selectedTenant?.roomNumber} (Phòng cũ)</option>
                  {emptyRooms.map((num) => (
                    <option key={num} value={num}>Phòng {num}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-startDate" className="text-[11px] text-stone-600 font-semibold">Ngày nhận phòng</Label>
                <Input id="edit-startDate" type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-deposit" className="text-[11px] text-stone-600 font-semibold">Tiền đặt cọc phòng (VND)</Label>
              <Input id="edit-deposit" type="number" value={formDeposit} onChange={(e) => setFormDeposit(e.target.value)} required />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsOpenEdit(false)}>Hủy</Button>
              <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Cập nhật hồ sơ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
