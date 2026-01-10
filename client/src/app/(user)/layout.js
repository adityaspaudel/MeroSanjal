import AllUsers from "@/components/fetchAllUsers";
import SocialMediaSidebarComponent from "@/components/social-media-sidebar";

import React from "react";

const UserLayout = ({ children }) => {
	return (
		<div className="flex gap-0 ">
			<SocialMediaSidebarComponent />
			<main className="flex-1">{children}</main>
			<aside>
				<AllUsers />
			</aside>
		</div>
	);
};

export default UserLayout;
