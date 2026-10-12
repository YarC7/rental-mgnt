"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
import { ResidenceBadge, addTwoYears } from "@/components/residence-badge";
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
  const [formResidenceStatus, setFormResidenceStatus] = useState<"unregistered" | "registered">("unregistered");
  const [formResidenceRegisteredAt, setFormResidenceRegisteredAt] = useState("");
  const [formResidenceExpiresAt, setFormResidenceExpiresAt] = useState("");
  // true khi admin đã sửa tay ngày hết hạn → không tự ghi đè nữa
  const [formResidenceExpiresTouched, setFormResidenceExpiresTouched] = useState(false);

  // Ngày hết hạn = ngày đăng ký + 2 năm, tự điền trừ khi đã sửa tay
  const handleResidenceRegisteredAtChange = (value: string) => {
    setFormResidenceRegisteredAt(value);
    if (!formResidenceExpiresTouched) {
      setFormResidenceExpiresAt(value ? addTwoYears(value) : "");
    }
  };

  // Filter empty rooms of active hostel
  const hostelRooms = rooms.filter((r) => r.hostelId === currentHostel);
  const emptyRooms = hostelRooms.filter((r) => r.status === "empty").map((r) => r.number);

  const selectedFormRoom = formRoom && emptyRooms.includes(formRoom) ? formRoom : (emptyRooms[0] ?? "");

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
    setFormResidenceStatus("unregistered");
    setFormResidenceRegisteredAt("");
    setFormResidenceExpiresAt("");
    setFormResidenceExpiresTouched(false);
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !selectedFormRoom) return;

    addTenant({
      name: formName,
      phone: formPhone,
      email: formEmail || "N/A",
      identityCard: formIdentity || "N/A",
      dob: "",
      gender: "",
      birthYear: formBirthYear,
      permanentAddress: formAddress || "N/A",
      roomNumber: selectedFormRoom,
      startDate: formStartDate || new Date().toISOString().split("T")[0],
      deposit: Number(formDeposit) || 0,
      isPrimary: false,
      residenceStatus: formResidenceStatus,
      residenceRegisteredAt: formResidenceStatus === "registered" ? formResidenceRegisteredAt : "",
      residenceExpiresAt: formResidenceStatus === "registered" ? formResidenceExpiresAt : "",
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
    setFormResidenceStatus(tenant.residenceStatus === "registered" ? "registered" : "unregistered");
    setFormResidenceRegisteredAt(tenant.residenceRegisteredAt || "");
    setFormResidenceExpiresAt(tenant.residenceExpiresAt || "");
    setFormResidenceExpiresTouched(false);
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
      residenceStatus: formResidenceStatus,
      residenceRegisteredAt: formResidenceStatus === "registered" ? formResidenceRegisteredAt : "",
      residenceExpiresAt: formResidenceStatus === "registered" ? formResidenceExpiresAt : "",
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

  const filteredTenants = useMemo(() => {
    return hostelTenants.filter((tenant) => {
      const term = searchTerm.toLowerCase();
      const room = rooms.find((r) => r.id === tenant.roomId);
      const roomNum = room ? room.number : "";
      return (
        tenant.name.toLowerCase().includes(term) ||
        tenant.phone.includes(term) ||
        roomNum.toLowerCase().includes(term)
      );
    });
  }, [hostelTenants, rooms, searchTerm]);

  // Group filtered tenants by room
  const groupedRooms = useMemo(() => {
    const hostelRooms = rooms.filter((r) => r.hostelId === currentHostel);
    const groups: {
      room: typeof rooms[0] | null;
      primaryTenant: Tenant | null;
      roommates: Tenant[];
    }[] = [];

    hostelRooms.forEach((room) => {
      const roomTenants = filteredTenants.filter((t) => t.roomId === room.id);
      if (roomTenants.length > 0) {
        const primary = roomTenants.find((t) => t.isPrimary) || roomTenants[0];
        const roommates = roomTenants.filter((t) => t.id !== primary.id);
        groups.push({
          room,
          primaryTenant: primary,
          roommates,
        });
      }
    });

    const unassignedTenants = filteredTenants.filter((t) => !t.roomId);
    if (unassignedTenants.length > 0) {
      unassignedTenants.forEach((tenant) => {
        groups.push({
          room: null,
          primaryTenant: tenant,
          roommates: [],
        });
      });
    }

    groups.sort((a, b) => {
      if (!a.room) return 1;
      if (!b.room) return -1;
      return a.room.number.localeCompare(b.room.number, undefined, { numeric: true });
    });

    return groups;
  }, [filteredTenants, rooms, currentHostel]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full 2xl:max-w-6xl mx-auto space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Danh sách Khách thuê - Nhà trọ {currentHostel}</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Quản lý hồ sơ lý lịch khách đang thuê trọ và thông tin đặt cọc phòng.</p>
        </div>

        <Dialog open={isOpenAdd} onOpenChange={(open) => { setIsOpenAdd(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button disabled={emptyRooms.length === 0} size="sm" className="text-xs gap-1.5 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Đăng ký khách thuê
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Đăng ký khách thuê mới (Nhà trọ {currentHostel})</DialogTitle>
              <DialogDescription className="text-xs">Lập hồ sơ khách thuê trọ và phân phối vào phòng trống.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="space-y-3.5 py-1.5">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-[11px] font-semibold">Họ và tên khách</Label>
                <Input id="name" placeholder="Nguyễn Văn A" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-[11px] font-semibold">Số điện thoại</Label>
                  <Input id="phone" placeholder="09xxxxxxxx" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="birthYear" className="text-[11px] font-semibold">Năm sinh</Label>
                  <Input id="birthYear" type="number" placeholder="2000" value={formBirthYear} onChange={(e) => setFormBirthYear(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="identity" className="text-[11px] font-semibold">Số CCCD / Hộ chiếu</Label>
                  <Input id="identity" placeholder="001099xxxxxx" value={formIdentity} onChange={(e) => setFormIdentity(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-[11px] font-semibold">Địa chỉ thường trú</Label>
                  <Input id="address" placeholder="Thành phố, Tỉnh" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-[11px] font-semibold">Địa chỉ Email</Label>
                <Input id="email" type="email" placeholder="example@gmail.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div className="space-y-1">
                  <Label htmlFor="room" className="text-[11px] font-semibold">Phòng trống bàn giao</Label>
                  <NativeSelect id="room" value={selectedFormRoom} onChange={(e) => setFormRoom(e.target.value)}>
                    {emptyRooms.map((num) => (
                      <option key={num} value={num}>Phòng {num}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="startDate" className="text-[11px] font-semibold">Ngày nhận phòng</Label>
                  <Input id="startDate" type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="deposit" className="text-[11px] font-semibold">Tiền đặt cọc phòng (VND)</Label>
                <Input id="deposit" type="number" placeholder="2500000" value={formDeposit} onChange={(e) => setFormDeposit(e.target.value)} required />
              </div>
              <div className="space-y-2 border-t pt-3">
                <div className="space-y-1">
                  <Label htmlFor="residence-status" className="text-[11px] font-semibold">Đăng ký tạm trú</Label>
                  <NativeSelect id="residence-status" value={formResidenceStatus} onChange={(e) => setFormResidenceStatus(e.target.value as "unregistered" | "registered")}>
                    <option value="unregistered">Chưa đăng ký</option>
                    <option value="registered">Đã đăng ký</option>
                  </NativeSelect>
                </div>
                {formResidenceStatus === "registered" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="residence-registered-at" className="text-[11px] font-semibold">Ngày đăng ký</Label>
                      <Input id="residence-registered-at" type="date" value={formResidenceRegisteredAt} onChange={(e) => handleResidenceRegisteredAtChange(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="residence-expires-at" className="text-[11px] font-semibold">Ngày hết hạn</Label>
                      <Input id="residence-expires-at" type="date" value={formResidenceExpiresAt} onChange={(e) => { setFormResidenceExpiresAt(e.target.value); setFormResidenceExpiresTouched(true); }} />
                    </div>
                    <p className="col-span-2 text-[10px] text-muted-foreground italic">Ngày hết hạn tự động = ngày đăng ký + 2 năm (có thể sửa tay).</p>
                  </div>
                )}
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setIsOpenAdd(false)}>Hủy</Button>
                <Button type="submit" size="sm" className="text-xs">Đăng ký & Bàn giao</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex bg-card p-4 rounded-xl border shadow-xs gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khách thuê theo tên, SĐT hoặc số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>
      </div>

      {/* List Tenants in Accordion */}
      <div className="space-y-4">
        {groupedRooms.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-3">
            {groupedRooms.map((group) => {
              const roomId = group.room ? group.room.id : "unassigned";
              const roomNumber = group.room ? group.room.number : "Chưa phân phòng";
              const primary = group.primaryTenant;
              
              if (!primary) return null;

              return (
                <AccordionItem
                  key={roomId === "unassigned" ? `unassigned-${primary.id}` : roomId}
                  value={roomId === "unassigned" ? `unassigned-${primary.id}` : roomId}
                  className="bg-card border rounded-xl overflow-hidden shadow-xs"
                >
                  <div className="flex items-center justify-between hover:bg-muted/50 transition-colors pr-3 sm:pr-6">
                    <AccordionTrigger className="flex-1 px-4 sm:px-6 py-4 hover:no-underline border-0 bg-transparent">
                      <div className="w-full pr-4 text-left space-y-2.5">
                        {/* Row 1: Room badge & primary tenant */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground min-w-[90px] shrink-0">
                            {group.room ? `Phòng ${roomNumber}` : "Chưa phòng"}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs truncate">{primary.name}</span>
                              <Badge variant="warning" className="shrink-0">Chủ phòng</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{primary.phone}</p>
                          </div>
                        </div>

                        {/* Row 2: key facts strip, aligned across all rows */}
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 sm:gap-x-6 sm:pl-[102px] text-muted-foreground">
                          <div className="min-w-0">
                            <span className="text-[9px] block font-medium uppercase">CCCD</span>
                            <span className="font-mono text-foreground text-[11px] break-all">{primary.identityCard || "N/A"}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] block font-medium uppercase">Ngày nhận</span>
                            <span className="text-foreground text-[11px] whitespace-nowrap">{new Date(primary.startDate).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] block font-medium uppercase">Tiền cọc</span>
                            <span className="font-semibold text-foreground text-[11px] whitespace-nowrap">{formatPrice(primary.deposit)}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    {/* Right: Actions (placed OUTSIDE the button trigger to avoid invalid HTML nesting) */}
                    <div className="flex items-center gap-1 shrink-0 relative z-10">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(primary)}
                        aria-label={`Chỉnh sửa hồ sơ ${primary.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(primary.id)}
                        aria-label={`Xóa hồ sơ ${primary.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <AccordionContent className="px-4 sm:px-6 border-t bg-muted/30">
                    <div className="py-4 space-y-4">
                      {/* Detailed info of Primary tenant */}
                      <div className="bg-card p-4 rounded-lg border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground font-medium block text-[10px]">Năm sinh</span>
                          <span className="font-semibold">{primary.birthYear}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground font-medium block text-[10px]">Email</span>
                          <span className="break-all">{primary.email || "N/A"}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground font-medium block text-[10px]">Địa chỉ thường trú</span>
                          <span>{primary.permanentAddress}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground font-medium block text-[10px]">Tạm trú</span>
                          <span className="inline-block mt-1"><ResidenceBadge tenant={primary} /></span>
                        </div>
                      </div>

                      {/* Roommates section */}
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Thành viên ở ghép ({group.roommates.length})
                        </h4>

                        {group.roommates.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {group.roommates.map((mate) => (
                              <div key={mate.id} className="bg-card p-4 rounded-lg border flex justify-between items-center shadow-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs">{mate.name}</span>
                                    <span className="text-[10px] text-muted-foreground">({mate.birthYear})</span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                                    <p>SĐT: <span className="text-foreground font-medium">{mate.phone}</span></p>
                                    <p>CCCD: <span className="text-foreground font-mono">{mate.identityCard}</span></p>
                                    <p className="truncate max-w-xs" title={mate.permanentAddress}>Địa chỉ: <span className="text-foreground italic">{mate.permanentAddress}</span></p>
                                    <p className="pt-0.5"><ResidenceBadge tenant={mate} /></p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() => openEditDialog(mate)}
                                    aria-label={`Chỉnh sửa hồ sơ ${mate.name}`}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(mate.id)}
                                    aria-label={`Xóa hồ sơ ${mate.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Không có thành viên ở ghép</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="bg-card rounded-xl border shadow-xs py-12 text-center space-y-2">
            <ShieldAlert className="w-6 h-6 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground text-xs">Không có thông tin khách thuê phù hợp.</p>
          </div>
        )}
      </div>

      {/* Edit Tenant Dialog */}
      <Dialog open={isOpenEdit} onOpenChange={(open) => { setIsOpenEdit(open); if (!open) { setSelectedTenant(null); resetForm(); } }}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Chỉnh sửa hồ sơ khách thuê</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-3.5 py-1.5">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-[11px] font-semibold">Họ và tên khách</Label>
              <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-[11px] font-semibold">Số điện thoại</Label>
                <Input id="edit-phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-birthYear" className="text-[11px] font-semibold">Năm sinh</Label>
                <Input id="edit-birthYear" type="number" value={formBirthYear} onChange={(e) => setFormBirthYear(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-identity" className="text-[11px] font-semibold">Số CCCD / CMND</Label>
                <Input id="edit-identity" value={formIdentity} onChange={(e) => setFormIdentity(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-address" className="text-[11px] font-semibold">Địa chỉ thường trú</Label>
                <Input id="edit-address" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email" className="text-[11px] font-semibold">Địa chỉ Email</Label>
              <Input id="edit-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div className="space-y-1">
                <Label htmlFor="edit-room" className="text-[11px] font-semibold">Số phòng</Label>
                <NativeSelect id="edit-room" value={formRoom} onChange={(e) => setFormRoom(e.target.value)}>
                  <option value={selectedTenant?.roomNumber}>{selectedTenant?.roomNumber} (Phòng cũ)</option>
                  {emptyRooms.map((num) => (
                    <option key={num} value={num}>Phòng {num}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-startDate" className="text-[11px] font-semibold">Ngày nhận phòng</Label>
                <Input id="edit-startDate" type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-deposit" className="text-[11px] font-semibold">Tiền đặt cọc phòng (VND)</Label>
              <Input id="edit-deposit" type="number" value={formDeposit} onChange={(e) => setFormDeposit(e.target.value)} required />
            </div>
            <div className="space-y-2 border-t pt-3">
              <div className="space-y-1">
                <Label htmlFor="edit-residence-status" className="text-[11px] font-semibold">Đăng ký tạm trú</Label>
                <NativeSelect id="edit-residence-status" value={formResidenceStatus} onChange={(e) => setFormResidenceStatus(e.target.value as "unregistered" | "registered")}>
                  <option value="unregistered">Chưa đăng ký</option>
                  <option value="registered">Đã đăng ký</option>
                </NativeSelect>
              </div>
              {formResidenceStatus === "registered" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="edit-residence-registered-at" className="text-[11px] font-semibold">Ngày đăng ký</Label>
                    <Input id="edit-residence-registered-at" type="date" value={formResidenceRegisteredAt} onChange={(e) => handleResidenceRegisteredAtChange(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-residence-expires-at" className="text-[11px] font-semibold">Ngày hết hạn</Label>
                    <Input id="edit-residence-expires-at" type="date" value={formResidenceExpiresAt} onChange={(e) => { setFormResidenceExpiresAt(e.target.value); setFormResidenceExpiresTouched(true); }} />
                  </div>
                  <p className="col-span-2 text-[10px] text-muted-foreground italic">Ngày hết hạn tự động = ngày đăng ký + 2 năm (có thể sửa tay).</p>
                </div>
              )}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setIsOpenEdit(false)}>Hủy</Button>
              <Button type="submit" size="sm" className="text-xs">Cập nhật hồ sơ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
