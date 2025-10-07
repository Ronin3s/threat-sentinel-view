import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { time: "00:00", critical: 2, high: 4, medium: 8, low: 12 },
  { time: "04:00", critical: 1, high: 3, medium: 6, low: 10 },
  { time: "08:00", critical: 3, high: 5, medium: 12, low: 15 },
  { time: "12:00", critical: 5, high: 8, medium: 15, low: 20 },
  { time: "16:00", critical: 4, high: 6, medium: 10, low: 14 },
  { time: "20:00", critical: 2, high: 5, medium: 9, low: 13 },
];

export const IncidentChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Trends (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="critical" 
              stroke="hsl(var(--critical))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--critical))" }}
            />
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--warning))" }}
            />
            <Line 
              type="monotone" 
              dataKey="medium" 
              stroke="hsl(var(--info))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--info))" }}
            />
            <Line 
              type="monotone" 
              dataKey="low" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--success))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
