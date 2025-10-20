import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
