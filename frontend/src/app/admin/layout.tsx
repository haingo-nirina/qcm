import type { Metadata } from "next";
import { ConfirmProvider } from "@/components/admin/ui/ConfirmDialog";
import { ToastProvider } from "@/components/admin/ui/Toaster";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s | Back-office QCM" },
  robots: { index: false, follow: false },
};

/** Back-office : aucun élément du site public (ni menu, ni pied de page). Code chargé uniquement sous /admin. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="bo">
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </div>
  );
}
