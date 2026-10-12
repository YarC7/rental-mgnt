import { Badge } from "@/components/ui/badge";
import type { Tenant } from "@/context/HostelContext";

export type ResidenceState = "unregistered" | "active" | "expired";

type ResidenceInfo = Pick<Tenant, "residenceStatus" | "residenceExpiresAt">;

export function getResidenceState(t: ResidenceInfo): ResidenceState {
  if (t.residenceStatus !== "registered") return "unregistered";
  const today = new Date().toISOString().split("T")[0];
  if (t.residenceExpiresAt && t.residenceExpiresAt < today) return "expired";
  return "active";
}

export function formatShortDate(iso: string): string {
  // Luôn ra dd/mm/yyyy, cắt chuỗi trực tiếp để tránh lệch ngày do timezone
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Cộng 2 năm vào ngày YYYY-MM-DD (29/02 → 28/02 nếu năm đích không nhuận). */
export function addTwoYears(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = Number(m[1]) + 2;
  const month = Number(m[2]);
  const day = Math.min(Number(m[3]), new Date(year, month, 0).getDate());
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Badge + ngày đăng ký/hết hạn tạm trú của tenant. Quá hạn tự suy ra từ ngày hết hạn. */
export function ResidenceBadge({
  tenant,
  showDates = true,
  className,
}: {
  tenant: ResidenceInfo & Pick<Tenant, "residenceRegisteredAt">;
  showDates?: boolean;
  className?: string;
}) {
  const state = getResidenceState(tenant);
  if (state === "unregistered") {
    return <Badge variant="secondary" className={className}>Chưa ĐK tạm trú</Badge>;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className ?? ""}`}>
      {state === "expired" ? (
        <Badge variant="danger">Tạm trú hết hạn</Badge>
      ) : (
        <Badge variant="success">Đã ĐK tạm trú</Badge>
      )}
      {showDates && (
        <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
          {formatShortDate(tenant.residenceRegisteredAt)} → {formatShortDate(tenant.residenceExpiresAt)}
        </span>
      )}
    </span>
  );
}
