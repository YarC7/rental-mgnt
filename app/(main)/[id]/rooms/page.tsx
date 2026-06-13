"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { Plus, Search, Home, MoreVertical, Edit2, Trash2, ShieldAlert, LayoutGrid, List, ArrowUpDown, ArrowUp, ArrowDown, User, Crown, Loader2, QrCode } from "lucide-react";
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
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Html5Qrcode } from "html5-qrcode";

export default function RoomsPage() {
  const { rooms, tenants, addRoom, editRoom, deleteRoom, addTenant, editTenant, currentHostel } = useHostel();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form State
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const [formNumber, setFormNumber] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formStatus, setFormStatus] = useState<"empty" | "rented" | "maintenance">("empty");
  const [formDesc, setFormDesc] = useState("");

  // Add Tenant Form State
  const [isOpenAddTenant, setIsOpenAddTenant] = useState(false);
  const [tenantFormName, setTenantFormName] = useState("");
  const [tenantFormPhone, setTenantFormPhone] = useState("");
  const [tenantFormCccd, setTenantFormCccd] = useState("");
  const [tenantFormDob, setTenantFormDob] = useState("");
  const [tenantFormGender, setTenantFormGender] = useState("");

  // QR Scanner State & Ref
  const [isOpenQRScanner, setIsOpenQRScanner] = useState(false);
  const [qrError, setQrError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const resetForm = () => {
    setFormNumber("");
    setFormPrice("");
    setFormArea("");
    setFormStatus("empty");
    setFormDesc("");
  };

  const resetTenantForm = () => {
    setTenantFormName("");
    setTenantFormPhone("");
    setTenantFormCccd("");
    setTenantFormDob("");
    setTenantFormGender("");
  };

  const parseCCCDQR = (qrText: string) => {
    const parts = qrText.split("|");
    if (parts.length < 6) {
      alert("Định dạng mã QR không khớp với CCCD Việt Nam!");
      return null;
    }

    const cccd = parts[0].trim();
    const name = parts[2].trim();
    const rawDob = parts[3].trim(); // DDMMYYYY
    const gender = parts[4].trim();
    const address = parts[5].trim();

    let dob = "";
    let birthYear = "";
    if (rawDob && rawDob.length === 8) {
      const day = rawDob.substring(0, 2);
      const month = rawDob.substring(2, 4);
      const year = rawDob.substring(4, 8);
      dob = `${year}-${month}-${day}`;
      birthYear = year;
    }

    return {
      cccd,
      name,
      dob,
      birthYear,
      gender: gender === "Nam" || gender === "Nữ" ? gender : "Khác",
      address
    };
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
      }).catch((err) => {
        console.error("Error stopping scanner:", err);
      });
    }
  };

  useEffect(() => {
    if (isOpenQRScanner) {
      setQrError("");
      const timer = setTimeout(() => {
        const html5Qrcode = new Html5Qrcode("reader");
        scannerRef.current = html5Qrcode;

        html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText) => {
            const parsed = parseCCCDQR(decodedText);
            if (parsed) {
              setTenantFormName(parsed.name);
              setTenantFormCccd(parsed.cccd);
              setTenantFormDob(parsed.dob);
              if (parsed.gender) {
                setTenantFormGender(parsed.gender);
              }
              stopScanner();
              setIsOpenQRScanner(false);
            }
          },
          () => {
            // Bỏ qua lỗi quét trên từng khung hình
          }
        ).catch((err) => {
          console.error("Failed to start QR scanner:", err);
          setQrError("Không thể mở camera. Vui lòng cấp quyền camera cho trang web.");
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpenQRScanner]);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantFormName || !detailRoom) return;
    addTenant({
      name: tenantFormName,
      phone: tenantFormPhone,
      email: "",
      identityCard: tenantFormCccd,
      dob: tenantFormDob,
      gender: tenantFormGender,
      birthYear: tenantFormDob ? tenantFormDob.split("-")[0] : "",
      permanentAddress: "",
      roomNumber: detailRoom.number,
      roomId: detailRoom.id,
      startDate: new Date().toISOString().split("T")[0],
      deposit: 0,
    });
    // If no primary tenant yet, set this tenant as primary
    if (!detailRoom.tenantName) {
      editRoom(detailRoom.id, { tenantName: tenantFormName, deposit: 0 });
    }
    resetTenantForm();
    setIsOpenAddTenant(false);
  };

  const handleUnlinkTenant = (tenantId: string, tenantName: string, isPrimary: boolean) => {
    if (confirm(`Bạn có chắc chắn muốn gỡ người thuê ${tenantName} khỏi phòng này?`)) {
      // 1. Gỡ người thuê khỏi phòng bằng cách đặt roomId = null
      editTenant(tenantId, { roomId: null as any });

      // 2. Nếu người bị gỡ đang là chủ phòng, chọn người khác làm chủ phòng mới hoặc reset
      if (isPrimary && detailRoom) {
        const otherTenants = detailRoomTenants.filter(t => t.id !== tenantId);
        const nextPrimaryName = otherTenants.length > 0 ? otherTenants[0].name : "";
        const nextPrimaryDeposit = otherTenants.length > 0 ? otherTenants[0].deposit : 0;
        
        editRoom(detailRoom.id, { 
          tenantName: nextPrimaryName, 
          deposit: nextPrimaryDeposit 
        });

        // Cập nhật state cục bộ để giao diện phản ánh thay đổi ngay lập tức
        setDetailRoom({
          ...detailRoom,
          tenantName: nextPrimaryName,
          deposit: nextPrimaryDeposit
        });
      }
    }
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

  const openDetailDialog = (room: Room) => {
    setDetailRoom(room);
    setFormNumber(room.number);
    setFormPrice(room.price.toString());
    setFormArea(room.area.toString());
    setFormStatus(room.status);
    setFormDesc(room.description);
    setIsOpenDetail(true);
  };

  const detailRoomTenants = useMemo(() => {
    if (!detailRoom) return [];
    return tenants.filter(
      (t) => t.hostelId === currentHostel && (t.roomId === detailRoom.id || t.roomNumber === detailRoom.number)
    );
  }, [detailRoom, tenants, currentHostel]);

  const handleDetailSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailRoom || !formNumber || !formPrice || !formArea) return;
    editRoom(detailRoom.id, {
      number: formNumber,
      price: Number(formPrice),
      area: Number(formArea),
      status: formStatus,
      description: formDesc,
    });
    setIsOpenDetail(false);
    setDetailRoom(null);
    resetForm();
  };

  const filteredRooms = useMemo(() => {
    const hostelRooms = rooms.filter((r) => r.hostelId === currentHostel);
    return hostelRooms.filter((room) => {
      const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.tenantName && room.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" || room.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, currentHostel, searchTerm, statusFilter]);

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

  const columnHelper = createColumnHelper<Room>();

  const columns = [
    columnHelper.accessor("number", {
      header: "Phòng",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold text-stone-900">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("area", {
      header: "Diện tích",
      cell: (info) => <span className="text-stone-600">{info.getValue()} m²</span>,
    }),
    columnHelper.accessor("price", {
      header: "Giá thuê",
      cell: (info) => <span className="font-semibold text-stone-900">{formatPrice(info.getValue())}</span>,
    }),
    columnHelper.accessor("tenantName", {
      header: "Khách thuê",
      cell: (info) => info.getValue() || <span className="text-stone-400">—</span>,
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => getStatusBadge(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Hành động</div>,
      cell: ({ row }) => {
        const room = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 hover:text-stone-900">
                  <MoreVertical className="w-3.5 h-3.5" />
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
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredRooms,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isFetching = useIsFetching();

  return (
    <div className="p-8 w-full space-y-6 font-sans text-stone-900">
      {/* Global loading overlay */}
      {isFetching > 0 && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-lg px-3 py-2 shadow-sm">
          <Loader2 className="size-4 text-stone-500 animate-spin" />
          <span className="text-[11px] text-stone-500 font-medium">Đang đồng bộ...</span>
        </div>
      )}
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
        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 ${viewMode === "grid" ? "bg-stone-900 text-white" : "bg-white text-stone-400 hover:text-stone-600"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${viewMode === "list" ? "bg-stone-900 text-white" : "bg-white text-stone-400 hover:text-stone-600"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Initial loading state */}
      {isFetching > 0 && rooms.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-stone-400 animate-spin" />
            <p className="text-sm text-stone-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card key={room.id} className="bg-white border-stone-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between cursor-pointer" onClick={() => openDetailDialog(room)}>
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
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          {filteredRooms.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="bg-stone-50 border-b border-stone-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`py-3 px-4 font-semibold text-stone-600 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-stone-900" : ""} ${header.column.id === "actions" ? "text-right" : "text-left"}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            {
                              asc: <ArrowUp className="w-3 h-3 text-stone-500" />,
                              desc: <ArrowDown className="w-3 h-3 text-stone-500" />,
                            }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3 text-stone-400" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-stone-100">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => openDetailDialog(row.original)}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={`py-3 px-4 ${cell.column.id === "actions" ? "text-right" : ""}`} onClick={cell.column.id === "actions" ? (e) => e.stopPropagation() : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center space-y-3">
              <ShieldAlert className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-stone-500 text-sm">Không tìm thấy phòng nào phù hợp.</p>
            </div>
          )}
        </div>
      )}

      {/* Room Detail Dialog */}
      <Dialog open={isOpenDetail} onOpenChange={(open) => { setIsOpenDetail(open); if (!open) { setDetailRoom(null); resetForm(); } }}>
        <DialogContent className="max-w-xl bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-stone-900 text-base font-semibold flex items-center gap-2">
              Phòng {detailRoom?.number}
              {detailRoom && getStatusBadge(detailRoom.status)}
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">
              Thông tin chi tiết phòng trọ.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDetailSave} className="space-y-5 py-2">
            {/* Room Info Section */}
            <div>
              <h4 className="text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wide">Thông tin phòng</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="detail-number" className="text-stone-700 text-xs font-medium">Số phòng</Label>
                  <Input id="detail-number" placeholder="Ví dụ: 104" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-status" className="text-stone-700 text-xs font-medium">Trạng thái</Label>
                  <NativeSelect id="detail-status" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                    <option value="empty">Đang trống</option>
                    <option value="rented">Đã thuê</option>
                    <option value="maintenance">Bảo trì</option>
                  </NativeSelect>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="detail-price" className="text-stone-700 text-xs font-medium">Giá thuê (VND/tháng)</Label>
                  <Input id="detail-price" type="number" placeholder="2500000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-area" className="text-stone-700 text-xs font-medium">Diện tích (m²)</Label>
                  <Input id="detail-area" type="number" placeholder="25" value={formArea} onChange={(e) => setFormArea(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <Label htmlFor="detail-desc" className="text-stone-700 text-xs font-medium">Mô tả phòng</Label>
                <Input id="detail-desc" placeholder="Gác lửng, tủ đồ, máy lạnh..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              </div>
            </div>

            {/* Tenants Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                  Người thuê ({detailRoomTenants.length})
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-7 px-2.5 border-stone-300 text-stone-700"
                  onClick={() => setIsOpenAddTenant(true)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Thêm người thuê
                </Button>
              </div>
              {detailRoomTenants.length > 0 ? (
                <div className="space-y-2">
                  {detailRoomTenants.map((tenant) => {
                    const isPrimary = tenant.name === detailRoom?.tenantName;
                    return (
                      <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isPrimary && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                                  <Crown className="w-3 h-3" /> Chủ phòng
                                </span>
                              )}
                              <p className="text-sm font-semibold text-stone-900">{tenant.name}</p>
                            </div>
                            <p className="text-[11px] text-stone-500">{tenant.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            {tenant.deposit > 0 && (
                              <p className="text-xs text-stone-600">
                                Cọc: <span className="font-semibold text-stone-900">{formatPrice(tenant.deposit)}</span>
                              </p>
                            )}
                            {!isPrimary && detailRoom?.tenantName && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-[10px] h-6 px-2 text-stone-500 hover:text-amber-600 mt-1"
                                onClick={() => {
                                  editRoom(detailRoom!.id, { tenantName: tenant.name, deposit: tenant.deposit });
                                }}
                              >
                                <Crown className="w-3 h-3 mr-1" /> Đặt làm chủ phòng
                              </Button>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Gỡ khỏi phòng"
                            onClick={() => handleUnlinkTenant(tenant.id, tenant.name, isPrimary)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-stone-400 text-xs">
                  <User className="w-6 h-6 mx-auto mb-1" />
                  Chưa có người thuê
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 border-t border-stone-100">
              <Button type="button" variant="ghost" className="text-xs" onClick={() => { setIsOpenDetail(false); setDetailRoom(null); resetForm(); }}>Đóng</Button>
              <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Tenant Dialog */}
      <Dialog open={isOpenAddTenant} onOpenChange={(open) => { setIsOpenAddTenant(open); if (!open) resetTenantForm(); }}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="text-stone-900 text-base font-semibold">Thêm người thuê</DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">
              Phòng {detailRoom?.number} — Nhà trọ {currentHostel}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTenant} className="space-y-4 py-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs gap-1.5 py-2 px-3 border-stone-300 text-stone-700 hover:bg-stone-50"
              onClick={() => setIsOpenQRScanner(true)}
            >
              <QrCode className="w-4 h-4" /> Quét mã QR từ thẻ CCCD
            </Button>

            <div className="space-y-1.5">
              <Label htmlFor="tenant-name" className="text-stone-700 text-xs font-medium">Họ tên <span className="text-rose-500">*</span></Label>
              <Input id="tenant-name" placeholder="Nguyễn Văn A" value={tenantFormName} onChange={(e) => setTenantFormName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tenant-cccd" className="text-stone-700 text-xs font-medium">CCCD</Label>
                <Input id="tenant-cccd" placeholder="079201000001" value={tenantFormCccd} onChange={(e) => setTenantFormCccd(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tenant-phone" className="text-stone-700 text-xs font-medium">Số điện thoại</Label>
                <Input id="tenant-phone" placeholder="0912345678" value={tenantFormPhone} onChange={(e) => setTenantFormPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tenant-dob" className="text-stone-700 text-xs font-medium">Ngày sinh</Label>
                <Input id="tenant-dob" type="date" value={tenantFormDob} onChange={(e) => setTenantFormDob(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tenant-gender" className="text-stone-700 text-xs font-medium">Giới tính</Label>
                <NativeSelect id="tenant-gender" value={tenantFormGender} onChange={(e) => setTenantFormGender(e.target.value)}>
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </NativeSelect>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="text-xs" onClick={() => { setIsOpenAddTenant(false); resetTenantForm(); }}>Hủy</Button>
              <Button type="submit" className="bg-stone-900 text-white text-xs hover:bg-stone-800">Thêm người thuê</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      {/* QR Scanner Dialog */}
      <Dialog open={isOpenQRScanner} onOpenChange={(open) => {
        setIsOpenQRScanner(open);
        if (!open) {
          stopScanner();
        }
      }}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="text-stone-900 text-base font-semibold">Quét mã QR CCCD</DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">
              Đặt mã QR trên thẻ CCCD vào khung hình để quét tự động.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div id="reader" className="w-full aspect-square max-w-[280px] bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative">
              <div className="absolute inset-0 border-2 border-emerald-500 rounded-lg animate-pulse pointer-events-none" />
            </div>
            {qrError && <p className="text-xs text-rose-500 mt-2 text-center">{qrError}</p>}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsOpenQRScanner(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
