import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
	title: string;
	value: string;
	trend: "up" | "down";
	change: string;
}

export function KpiCard({ title, value, trend, change }: KpiCardProps) {
	const TrendIcon = trend === "up" ? ArrowUp : ArrowDown;
	const ChartIcon = trend === "up" ? TrendingUp : TrendingDown;

	return (
		<Card>
			<CardHeader className='pb-2'>
				<CardTitle className='text-sm font-medium text-muted-foreground'>
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-between'>
					<div>
						<div className='text-2xl font-bold'>{value}</div>
						<div
							className={`flex items-center text-sm ${
								trend === "up"
									? "text-green-500"
									: "text-red-500"
							}`}
						>
							<TrendIcon className='h-4 w-4 mr-1' />
							{change}
						</div>
					</div>
					<div className='w-16 h-12 flex items-center justify-center'>
						<ChartIcon
							className={`h-8 w-8 ${
								trend === "up"
									? "text-green-500"
									: "text-red-500"
							}`}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
