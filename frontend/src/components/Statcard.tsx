import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  value: string | number;
  badge: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  badgeClass?: string;
}

export function StatsCard({
  title,
  value,
  badge,
  icon: Icon,
  iconBgColor,
  iconColor,
  badgeClass,
}: StatsCardProps) {
  return (
    <Card className="group border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-500">{title}</p>

            <h2 className="text-4xl font-bold mt-2">
              {value}
            </h2>

            <Badge className={`mt-3 ${badgeClass}`}>
              {badge}
            </Badge>
          </div>

          <div
            className={`${iconBgColor} transition-all p-4 rounded-2xl`}
          >
            <Icon
              className={`h-7 w-7 ${iconColor}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}