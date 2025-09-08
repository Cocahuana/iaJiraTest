import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
export function ChatPrompt() {
	return (
		<Card className='flex w-1/2'>
			<CardHeader>
				<CardTitle>AI Assistant</CardTitle>
				<Select>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Select a project' />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Select Project</SelectLabel>
							<SelectItem value='project-1'>project 1</SelectItem>
							<SelectItem value='project-2'>project 2</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					<Textarea
						placeholder='Ask about financial trends, comparisons, or predictions...'
						className='min-h-[100px]'
					/>
					<div className='flex justify-end'>
						<Button>
							<Send className='h-4 w-4 mr-2' />
							Analyze
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
