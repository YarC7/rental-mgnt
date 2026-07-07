"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

export interface Room {
  id: string;
  hostelId: string;
  number: string;
  price: number;
  area: number;
  status: "empty" | "rented" | "maintenance";
  description: string;
  tenantName?: string;
  deposit?: number; // Số tiền cọc phòng đang thuê
}

export interface Tenant {
  id: string;
  hostelId: string;
  name: string;
  phone: string;
  email: string;
  identityCard: string;      // CCCD
  dob: string;               // Ngày sinh
  gender: string;            // Giới tính
  birthYear: string;         // Năm sinh
  permanentAddress: string;  // Địa chỉ thường trú
  identityCardIssueDate?: string;
  roomNumber: string;
  roomId?: string;           // ID của phòng trọ từ Database
  startDate: string;         // Ngày bắt đầu ở
  deposit: number;           // Tiền cọc phòng
  isPrimary: boolean;        // Chủ phòng hay ở ghép
}

export interface Service {
  id: string;
  hostelId: string;
  name: string;
  price: number;
  unit: string;
  status: "active" | "inactive";
  description: string;
}

export interface Invoice {
  id: string;
  hostelId: string;
  roomNumber: string;
  tenantName: string;
  month: string;
  roomPrice: number;
  electricityCost: number;
  waterCost: number;
  otherServicesCost: number;
  total: number;
  status: "paid" | "unpaid";
  createdAt: string;
}

export interface Hostel {
  id: string;
  name: string;
  createdAt: string;
}

interface HostelContextType {
  currentHostel: string;
  setCurrentHostel: (hostel: string) => void;
  hostels: Hostel[];
  // Rooms
  rooms: Room[];
  addRoom: (room: Omit<Room, "id" | "hostelId">) => void;
  editRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  // Tenants
  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, "id" | "hostelId">) => void;
  editTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  // Services
  services: Service[];
  addService: (service: Omit<Service, "id" | "hostelId">) => void;
  editService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  toggleServiceStatus: (id: string) => void;
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id" | "hostelId" | "createdAt">) => void;
  deleteInvoice: (id: string) => void;
  toggleInvoicePaid: (id: string) => void;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

// Stable empty array reference to avoid triggering useEffect loops
const EMPTY_ARRAY: any[] = [];

export interface RoomUsage {
  id: string;
  roomId: string;
  month: string;
  electricityStart: number;
  electricityEnd: number;
  waterStart: number;
  waterEnd: number;
  createdAt: string;
}

export interface Hostel {
  id: string;
  name: string;
  createdAt: string;
}

interface HostelContextType {
  currentHostel: string;
  setCurrentHostel: (hostel: string) => void;
  hostels: Hostel[];
  // Rooms
  rooms: Room[];
  addRoom: (room: Omit<Room, "id" | "hostelId">) => void;
  editRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  // Room Usages
  getRoomUsages: (roomId: string, tenantId?: string) => Promise<RoomUsage[]>;
  saveRoomUsage: (roomId: string, usage: Omit<RoomUsage, "id" | "roomId" | "createdAt">) => Promise<RoomUsage>;
  // Tenants
  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, "id" | "hostelId">) => void;
  editTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  // Services
  services: Service[];
  addService: (service: Omit<Service, "id" | "hostelId">) => void;
  editService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  toggleServiceStatus: (id: string) => void;
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id" | "hostelId" | "createdAt">) => void;
  deleteInvoice: (id: string) => void;
  toggleInvoicePaid: (id: string) => void;
}

export const HostelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [currentHostel, setCurrentHostel] = useState<string>("A");

  // Load hostels
  const { data: rawHostels } = useQuery<Hostel[]>({
    queryKey: ["hostels"],
    queryFn: () => fetch("/api/hostels").then((res) => {
      if (!res.ok) throw new Error("Failed to fetch hostels");
      return res.json();
    }),
  });
  const hostels = rawHostels || (EMPTY_ARRAY as Hostel[]);

  // Synchronize currentHostel state with URL parameter (first path segment)
  useEffect(() => {
    if (!pathname) return;
    const segments = pathname.split("/");
    const hostelSegment = segments[1];
    const staticSegments = ["", "tenants", "invoices", "settings", "api"];
    if (hostelSegment && !staticSegments.includes(hostelSegment)) {
      setCurrentHostel(hostelSegment);
    }
  }, [pathname]);

  // Load currentHostel from localStorage on mount as fallback
  useEffect(() => {
    const saved = localStorage.getItem("currentHostel");
    if (saved) {
      const segments = pathname?.split("/") || [];
      const hostelSegment = segments[1];
      const staticSegments = ["", "tenants", "invoices", "settings", "api"];
      if (hostelSegment && !staticSegments.includes(hostelSegment)) {
        return;
      }
      setCurrentHostel(saved);
    }
  }, [pathname]);

  const handleSetCurrentHostel = (hostel: string) => {
    setCurrentHostel(hostel);
    localStorage.setItem("currentHostel", hostel);
  };

  // --- React Query Queries ---
  const { data: rawRooms } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: () => fetch("/api/rooms").then((res) => {
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return res.json();
    }),
  });

  const { data: rawTenants } = useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: () => fetch("/api/tenants").then((res) => {
      if (!res.ok) throw new Error("Failed to fetch tenants");
      return res.json();
    }),
  });

  const { data: rawServices } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: () => fetch("/api/services").then((res) => {
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    }),
  });

  const { data: rawInvoices } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((res) => {
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    }),
  });

  // Client-side synchronization: Enrich Room structures with Tenant information
  const [rooms, setRooms] = useState<Room[]>([]);
  useEffect(() => {
    const roomsList = rawRooms || (EMPTY_ARRAY as Room[]);
    const tenantsList = rawTenants || (EMPTY_ARRAY as Tenant[]);

    const enriched = roomsList.map((room) => {
      let activeTenant = tenantsList.find(
        (t) => t.hostelId === room.hostelId && t.roomId === room.id && t.isPrimary
      ) || tenantsList.find(
        (t) => t.hostelId === room.hostelId && t.roomNumber === room.number && t.isPrimary
      );

      if (!activeTenant) {
        activeTenant = tenantsList.find(
          (t) => t.hostelId === room.hostelId && t.roomId === room.id
        ) || tenantsList.find(
          (t) => t.hostelId === room.hostelId && t.roomNumber === room.number
        );
      }

      if (room.status === "maintenance") return room;

      return {
        ...room,
        tenantName: activeTenant ? activeTenant.name : undefined,
        deposit: activeTenant ? activeTenant.deposit : undefined,
        status: (activeTenant ? "rented" : "empty") as "empty" | "rented" | "maintenance",
      };
    });
    setRooms(enriched);
  }, [rawRooms, rawTenants]);

  // Map rawTenants to local interface safely
  const tenants = rawTenants || (EMPTY_ARRAY as Tenant[]);
  const services = rawServices || (EMPTY_ARRAY as Service[]);
  const invoices = rawInvoices || (EMPTY_ARRAY as Invoice[]);

  // --- React Query Mutations ---

  // Rooms Mutations
  const addRoomMutation = useMutation({
    mutationFn: (newRoom: Omit<Room, "id" | "hostelId">) =>
      fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRoom, hostelId: currentHostel }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const editRoomMutation = useMutation({
    mutationFn: ({ id, room }: { id: string; room: Partial<Room> }) =>
      fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(room),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/rooms/${id}`, { method: "DELETE" }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  // Tenants Mutations
  const addTenantMutation = useMutation({
    mutationFn: (newTenant: Omit<Tenant, "id" | "hostelId">) =>
      fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTenant, hostelId: currentHostel }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const editTenantMutation = useMutation({
    mutationFn: ({ id, tenant }: { id: string; tenant: Partial<Tenant> }) =>
      fetch(`/api/tenants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenant),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/tenants/${id}`, { method: "DELETE" }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  // Services Mutations
  const addServiceMutation = useMutation({
    mutationFn: (newService: Omit<Service, "id" | "hostelId">) =>
      fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newService, hostelId: currentHostel }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const editServiceMutation = useMutation({
    mutationFn: ({ id, service }: { id: string; service: Partial<Service> }) =>
      fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/services/${id}`, { method: "DELETE" }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // Invoices Mutations
  const addInvoiceMutation = useMutation({
    mutationFn: (newInvoice: Omit<Invoice, "id" | "hostelId" | "createdAt">) =>
      fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newInvoice, hostelId: currentHostel }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/invoices/${id}`, { method: "DELETE" }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const editInvoiceMutation = useMutation({
    mutationFn: ({ id, invoice }: { id: string; invoice: Partial<Invoice> }) =>
      fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  // --- Context API Bindings ---
  const addRoom = (room: Omit<Room, "id" | "hostelId">) => {
    addRoomMutation.mutate(room);
  };

  const editRoom = (id: string, updatedFields: Partial<Room>) => {
    editRoomMutation.mutate({ id, room: updatedFields });
  };

  const deleteRoom = (id: string) => {
    deleteRoomMutation.mutate(id);
  };

  const addTenant = (tenant: Omit<Tenant, "id" | "hostelId">) => {
    addTenantMutation.mutate(tenant);
  };

  const editTenant = (id: string, updatedFields: Partial<Tenant>) => {
    editTenantMutation.mutate({ id, tenant: updatedFields });
  };

  const deleteTenant = (id: string) => {
    deleteTenantMutation.mutate(id);
  };

  const addService = (service: Omit<Service, "id" | "hostelId">) => {
    addServiceMutation.mutate(service);
  };

  const editService = (id: string, updatedFields: Partial<Service>) => {
    editServiceMutation.mutate({ id, service: updatedFields });
  };

  const deleteService = (id: string) => {
    deleteServiceMutation.mutate(id);
  };

  const toggleServiceStatus = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      const nextStatus = service.status === "active" ? "inactive" : "active";
      editServiceMutation.mutate({ id, service: { status: nextStatus } });
    }
  };

  const addInvoice = (invoice: Omit<Invoice, "id" | "hostelId" | "createdAt">) => {
    addInvoiceMutation.mutate(invoice);
  };

  const deleteInvoice = (id: string) => {
    deleteInvoiceMutation.mutate(id);
  };

  const toggleInvoicePaid = (id: string) => {
    const invoice = invoices.find((i) => i.id === id);
    if (invoice) {
      const nextStatus = invoice.status === "paid" ? "unpaid" : "paid";
      editInvoiceMutation.mutate({ id, invoice: { status: nextStatus } });
    }
  };

  const getRoomUsages = async (roomId: string, tenantId?: string): Promise<RoomUsage[]> => {
    let url = `/api/rooms/${roomId}/usages`;
    if (tenantId) {
      url += `?tenantId=${tenantId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch room usages");
    return res.json();
  };

  const saveRoomUsage = async (
    roomId: string,
    usage: Omit<RoomUsage, "id" | "roomId" | "createdAt">
  ): Promise<RoomUsage> => {
    const res = await fetch(`/api/rooms/${roomId}/usages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usage),
    });
    if (!res.ok) throw new Error("Failed to save room usage");
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    return res.json();
  };

  return (
    <HostelContext.Provider
      value={{
        currentHostel,
        setCurrentHostel: handleSetCurrentHostel,
        hostels,
        rooms,
        addRoom,
        editRoom,
        deleteRoom,
        getRoomUsages,
        saveRoomUsage,
        tenants,
        addTenant,
        editTenant,
        deleteTenant,
        services,
        addService,
        editService,
        deleteService,
        toggleServiceStatus,
        invoices,
        addInvoice,
        deleteInvoice,
        toggleInvoicePaid,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (context === undefined) {
    throw new Error("useHostel must be used within a HostelProvider");
  }
  return context;
};
