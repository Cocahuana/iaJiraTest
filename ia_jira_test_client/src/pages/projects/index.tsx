import { Layout } from "../../components/Layout";
import { KpiCard } from "../../components/KpiCard";
import { ChatPrompt } from "../../components/ChatPrompt";
import Link from "next/link";

export default function ProjectsHome() {
	const projects = ["Project Alpha", "Project Beta", "Project Gamma"];

	return (
		<Layout>
			<h1 className='text-2xl font-bold mb-4'>Projects - Home</h1>
			<select className='border rounded p-2 mb-4'>
				{projects.map((p) => (
					<option key={p}>{p}</option>
				))}
			</select>
			<div className='space-y-6'>
				<div className='flex gap-4 mb-4'>
					<Link
						href='/projects'
						className='px-3 py-1 bg-blue-500 text-white rounded'
					>
						Home
					</Link>
					<Link
						href='/projects/finance'
						className='px-3 py-1 bg-gray-500 rounded'
					>
						Finance
					</Link>
					<Link
						href='/projects/graphs'
						className='px-3 py-1 bg-gray-500 rounded'
					>
						Graphs
					</Link>
				</div>

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
