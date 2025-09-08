import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { ChatPrompt } from "@/components/ChatPrompt";
export default function Dashboard() {
	return (
		<Layout>
			<div className='space-y-6'>
				<h1 className='text-3xl font-bold'>Organization Dashboard</h1>

				<div className='grid gap-4 md:grid-cols-3'>
					<KpiCard
						title='Total Revenue'
						value='$22,366.50'
						trend='up'
						change='+12% from last month'
					/>
					<KpiCard
						title='Expenses'
						value='$30.34'
						trend='down'
						change='-5% from last month'
					/>
					<KpiCard
						title='Net Profit'
						value='$1,234.56'
						trend='up'
						change='+8% from last month'
					/>
				</div>
				<div className='flex w-full justify-center'>
					<ChatPrompt />
				</div>
			</div>
		</Layout>
	);
}
