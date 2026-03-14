import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickStatItem {
  label: string;
  value: string;
}

export const QuickStats = ({ items }: { items: QuickStatItem[] }) => {
  return (
    <Card>
      <CardHeader className="px-7 pt-7 pb-2">
        <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="px-7 pb-7 space-y-6 mt-4">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-slate-500">{item.label}</span>
            <span className="text-xl font-bold text-slate-900">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};