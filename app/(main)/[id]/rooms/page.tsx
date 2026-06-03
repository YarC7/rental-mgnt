"use client";

import { useState } from "react";
import { Plus, Search, Home, MoreVertical, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NativeSelect } from "@/components/ui/native-select";
import { useHostel, Room } from "@/context/HostelContext";

export default function RoomsPage() {
  const { rooms, addRoom, editRoom, deleteRoom, currentHostel } = useHostel();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form State
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const [formNumber, setFormNumber] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formStatus, setFormStatus] = useState<"empty" | "rented" | "maintenance">("empty");
  const [formDesc, setFormDesc] = useState("");

  const resetForm = () => {
    setFormNumber("");
    setFormPrice("");
    setFormArea("");
    setFormStatus("empty");
    setFormDesc("");
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || !formPrice || !formArea) return;

    addRoom({
      number: formNumber,
      price: Number(formPrice),
      area: Number(formArea),
      status: formStatus,
      description: formDesc,
    });

    resetForm();
    setIsOpenAdd(false);
  };

  const openEditDialog = (room: Room) => {
    setCurrentRoom(room);
    setFormNumber(room.number);
    setFormPrice(room.price.toString());
    setFormArea(room.area.toString());
    setFormStatus(room.status);
    setFormDesc(room.description);
    setIsOpenEdit(true);
  };

  const handleEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom || !formNumber || !formPrice || !formArea) return;

    editRoom(currentRoom.id, {
      number: formNumber,
      price: Number(formPrice),
      area: Number(formArea),
      status: formStatus,
      description: formDesc,
    });

    setIsOpenEdit(false);
    setCurrentRoom(null);
    resetForm();
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      deleteRoom(id);
    }
  };

  // Filter rooms by active hostel first, then by search & status
  const hostelRooms = rooms.filter((r) => r.hostelId === currentHostel);

  const filteredRooms = hostelRooms.filter((room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.tenantName && room.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Room["status"]) => {
    switch (status) {
      case "empty":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Đang trống</Badge>;
      case "rented":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đã thuê</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Bảo trì</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="p-8 max-w-6xl space-y-6 font-sans text-stone-900">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Quản lý Phòng trọ - Nhà trọ {currentHostel}</h2>
          <p className="text-stone-500 text-xs mt-0.5">Danh sách, trạng thái và thiết lập giá các phòng trong khu trọ.</p>
        </div>

        <Dialog open={isOpenAdd} onOpenChange={(open) => { setIsOpenAdd(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-stone-900 hover:bg-stone-800 text-white text-xs gap-1.5 py-2 px-3.5 rounded-lg shadow-sm">
              <Plus className="w-4 h-4" /> Thêm phòng mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-stone-900 text-base font-semibold">Tạo phòng trọ mới (Nhà trọ {currentHostel})</DialogTitle>
              <DialogDescription className="text-stone-500 text-xs">Điền các thông tin cơ bản để thêm phòng trọ vào hệ thống.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="number" className="text-stone-700 text-xs font-medium">Số phòng</Label>
                  <Input id="number" placeholder="Ví dụ: 104" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-stone-700 text-xs font-medium">Trạng thái</Label>
                  <NativeSelect id="status" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                    <option value="empty">Đang trống</option>
                    <option value="rented">Đã thuê</option>
                    <option value="maintenance">Bảo trì</option>
                  </NativeSelect>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-stone-700 text-xs font-medium">Giá thuê (VND/tháng)</Label>
                  <Input id="price" type="number" placeholder="2500000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="area" className="text-stone-700 text-xs font-medium">Diện tích (m²)</Label>
                  <Input id="area" type="number" placeholder="25" value={formArea} onChange={(e) => setFormArea(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-stone-700 text-xs font-medium">Mô tả phòng</Label>
                <Input id="desc" placeholder="Gác lửng, tủ đồ, máy lạnh..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsOpenAdd(false)}>Hủy</Button>
                <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Lưu lại</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Tìm theo số phòng hoặc khách thuê..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>
        <div className="w-full 2xl:max-w-6xl sm:w-48">
          <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs">
            <option value="all">Tất cả trạng thái</option>
            <option value="empty">Đang trống</option>
            <option value="rented">Đã thuê</option>
            <option value="maintenance">Bảo trì</option>
          </NativeSelect>
        </div>
      </div>

      {/* Grid List Rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <Card key={room.id} className="bg-white border-stone-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-stone-900">Phòng {room.number}</CardTitle>
                    <p className="text-[10px] text-stone-500">{room.area} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusBadge(room.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500 hover:text-stone-950">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => openEditDialog(room)} className="text-xs flex gap-2 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteRoom(room.id)} className="text-xs text-rose-600 flex gap-2 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Xóa phòng
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="py-2 flex-1">
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-stone-400 font-medium">GIÁ THUÊ</p>
                    <p className="text-lg font-bold text-stone-900 leading-tight">{formatPrice(room.price)}<span className="text-[10px] text-stone-500 font-normal">/tháng</span></p>
                  </div>
                  {room.tenantName ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-stone-400 font-medium">KHÁCH THUÊ</p>
                        <p className="text-xs font-semibold text-stone-800 truncate" title={room.tenantName}>{room.tenantName}</p>
                      </div>
                      {room.deposit !== undefined && (
                        <div>
                          <p className="text-[10px] text-stone-400 font-medium">TIỀN ĐẶT CỌC</p>
                          <p className="text-xs font-bold text-stone-900">{formatPrice(room.deposit)}</p>
                        </div>
                      )}
                    </div>
                  ) : room.status === "empty" ? (
                    <p className="text-xs text-emerald-600 font-medium">Sẵn sàng đón khách mới</p>
                  ) : (
                    <p className="text-xs text-amber-600 font-medium">Tạm khóa hoạt động</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
            <ShieldAlert className="w-8 h-8 mx-auto text-stone-400" />
            <p className="text-stone-500 text-sm">Không tìm thấy phòng nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Edit Room Dialog */}
      <Dialog open={isOpenEdit} onOpenChange={(open) => { setIsOpenEdit(open); if (!open) { setCurrentRoom(null); resetForm(); } }}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-stone-900 text-base font-semibold">Chỉnh sửa phòng {currentRoom?.number}</DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">Cập nhật thông tin chi tiết của phòng trọ này.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRoom} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-number" className="text-stone-700 text-xs font-medium">Số phòng</Label>
                <Input id="edit-number" placeholder="Ví dụ: 104" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-stone-700 text-xs font-medium">Trạng thái</Label>
                <NativeSelect id="edit-status" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                  <option value="empty">Đang trống</option>
                  <option value="rented">Đã thuê</option>
                  <option value="maintenance">Bảo trì</option>
                </NativeSelect>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-price" className="text-stone-700 text-xs font-medium">Giá thuê (VND/tháng)</Label>
                <Input id="edit-price" type="number" placeholder="2500000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-area" className="text-stone-700 text-xs font-medium">Diện tích (m²)</Label>
                <Input id="edit-area" type="number" placeholder="25" value={formArea} onChange={(e) => setFormArea(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc" className="text-stone-700 text-xs font-medium">Mô tả phòng</Label>
              <Input id="edit-desc" placeholder="Gác lửng, tủ đồ, máy lạnh..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsOpenEdit(false)}>Hủy</Button>
              <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
