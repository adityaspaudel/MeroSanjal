import { SocialMediaSidebarComponent } from "@/components/social-media-sidebar";
import React from "react";

const Following = () => {
	const usersFollowings = [
		{
			username: "jsmith84",
			fullName: "John Smith",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jsmith84",
		},
		{
			username: "sarahk",
			fullName: "Sarah Kennedy",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahk",
		},
		{
			username: "mzhou",
			fullName: "Ming Zhou",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mzhou",
		},
		{
			username: "aisha_j",
			fullName: "Aisha Jabari",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha_j",
		},
		{
			username: "rob_wilson",
			fullName: "Robert Wilson",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rob_wilson",
		},
		{
			username: "elena89",
			fullName: "Elena Rodriguez",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena89",
		},
		{
			username: "davidk",
			fullName: "David Kim",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=davidk",
		},
		{
			username: "lisa_m",
			fullName: "Lisa Murphy",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa_m",
		},
		{
			username: "ahmed_h",
			fullName: "Ahmed Hassan",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed_h",
		},
		{
			username: "emma_w",
			fullName: "Emma Watson",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma_w",
		},
		{
			username: "carlos_r",
			fullName: "Carlos Ruiz",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos_r",
		},
		{
			username: "natalie_p",
			fullName: "Natalie Parker",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=natalie_p",
		},
		{
			username: "kevin_l",
			fullName: "Kevin Lee",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kevin_l",
		},
		{
			username: "sophie_b",
			fullName: "Sophie Brown",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie_b",
		},
		{
			username: "marcus_j",
			fullName: "Marcus Johnson",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus_j",
		},
		{
			username: "anna_k",
			fullName: "Anna Kowalski",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anna_k",
		},
		{
			username: "raj_p",
			fullName: "Raj Patel",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=raj_p",
		},
		{
			username: "maya_s",
			fullName: "Maya Singh",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya_s",
		},
		{
			username: "thomas_m",
			fullName: "Thomas Mueller",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas_m",
		},
		{
			username: "olivia_c",
			fullName: "Olivia Chen",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia_c",
		},
	];
	return (
		<div className="flex gap-2 bg-blue-100">
			{/* <SocialMediaSidebarComponent /> */}
			<div>
				<h1 className="font-bold">following</h1>
				<div className="text-sm">
					{usersFollowings.map((item) => {
						return (
							<div className="flex gap-2 p-2 hover:bg-blue-200">
								<div className="italic">@{item.username}</div>
								<div>{item.fullName}</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default Following;
