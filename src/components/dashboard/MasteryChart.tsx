import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MasteryChartProps {
  data: { week: string; mastery: number }[];
}

export const MasteryChart = ({ data }: MasteryChartProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="px-7 pt-7 pb-2">
        <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Avg. Mastery Progress</CardTitle>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }}
              domain={[0, 100]} // Ensures the scale is always 0-100%
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                color: "#0f172a",
                fontWeight: 500,
                fontSize: "13px"
              }}
              formatter={(value: number) => [`${value}%`, "Avg Mastery"]}
            />
            <Bar 
              dataKey="mastery" 
              fill="url(#masteryGradient)" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={50} 
            />
            <defs>
              <linearGradient id="masteryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};