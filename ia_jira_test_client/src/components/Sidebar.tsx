import Link from "next/link";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";

export default function Sidebar() {
	const [open, setOpen] = useState(true);

	const mainLinks = [
		{ label: "Organization", href: "/organization" },
		{ label: "Projects", href: "/projects" },
		{ label: "Prompts", href: "/prompts" },
		{ label: "Graph", href: "/graph" },
		{ label: "Configuration", href: "/configuration" },
	];

	return (
		<div
			className={`bg-gray-800 text-white ${
				open ? "w-48" : "w-12"
			} transition-all`}
		>
			<div className='flex items-center justify-between p-2 border-b border-gray-700'>
				{open ? <span className='font-bold'>Logo</span> : null}
				<button onClick={() => setOpen(!open)}>
					<FiMenu />
				</button>
			</div>
			<nav className='mt-4'>
				<a href='/api/auth/login' className='btn btn-primary'>
					Login
				</a>
				{mainLinks.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className='block px-4 py-2 hover:bg-gray-700'
					>
						{open ? link.label : link.label[0]}
					</Link>
				))}
			</nav>
		</div>
	);
}
