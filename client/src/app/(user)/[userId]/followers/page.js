import { SocialMediaSidebarComponent } from "@/components/social-media-sidebar";
import Image from "next/image";
import React from "react";

const followers = () => {
	const userFollowers = [
		{
			username: "jsmith84",
			fullName: "John Smith",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "emiller22",
			fullName: "Emma Miller",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "rwilson45",
			fullName: "Robert Wilson",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "agarcia77",
			fullName: "Ana Garcia",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "mjohnson12",
			fullName: "Michael Johnson",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "ldavis99",
			fullName: "Laura Davis",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "tlee365",
			fullName: "Thomas Lee",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "smartinez55",
			fullName: "Sofia Martinez",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "wbrown33",
			fullName: "William Brown",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "kwhite67",
			fullName: "Katherine White",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "dthomas90",
			fullName: "David Thomas",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "oanderson44",
			fullName: "Olivia Anderson",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "htaylor23",
			fullName: "Henry Taylor",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "jmoore78",
			fullName: "Julia Moore",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "cjackson11",
			fullName: "Christopher Jackson",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "zmartin66",
			fullName: "Zoe Martin",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "bharris42",
			fullName: "Benjamin Harris",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "sclark89",
			fullName: "Sophia Clark",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "lrodriguez21",
			fullName: "Lucas Rodriguez",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "ilewis75",
			fullName: "Isabella Lewis",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "nlee123",
			fullName: "Nathan Lee",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "awalker87",
			fullName: "Ava Walker",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "dhall456",
			fullName: "Daniel Hall",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "vallen34",
			fullName: "Victoria Allen",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "eyoung56",
			fullName: "Ethan Young",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "gking78",
			fullName: "Grace King",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "pwright92",
			fullName: "Peter Wright",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "mlopez44",
			fullName: "Mia Lopez",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "jhill88",
			fullName: "James Hill",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "cscott76",
			fullName: "Charlotte Scott",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "rgreen55",
			fullName: "Ryan Green",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "manderson33",
			fullName: "Madison Anderson",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "aadams91",
			fullName: "Andrew Adams",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "enelson67",
			fullName: "Elizabeth Nelson",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "jbaker45",
			fullName: "Joseph Baker",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "shill99",
			fullName: "Samantha Hill",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "cmorris22",
			fullName: "Charles Morris",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "rrogers88",
			fullName: "Rachel Rogers",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "tmorgan34",
			fullName: "Tyler Morgan",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "lbell77",
			fullName: "Lauren Bell",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "acooper66",
			fullName: "Alexander Cooper",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "hross43",
			fullName: "Hannah Ross",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "bwood89",
			fullName: "Brandon Wood",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "kparker54",
			fullName: "Kayla Parker",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "jmorgan76",
			fullName: "Jason Morgan",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "abutler32",
			fullName: "Ashley Butler",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "sross65",
			fullName: "Sebastian Ross",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "ncooper87",
			fullName: "Natalie Cooper",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "dmorris55",
			fullName: "Dylan Morris",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "vwong43",
			fullName: "Victoria Wong",
			avatar: "/api/placeholder/150/150",
		},
		{
			username: "bchen78",
			fullName: "Benjamin Chen",
			avatar: "/api/placeholder/150/150",
		},
	];

	return (
		<div className="flex gap-4 bg-blue-100">
			{/* <SocialMediaSidebarComponent /> */}
			<div className="">
				<h1 className="font-bold p-2">followers</h1>
				<div>
					{userFollowers.map((item) => {
						return (
							<div className="flex gap-4 p-2 hover:bg-blue-200 text-sm">
								{/* <Image
									src={item.avatar}
									height={100}
									width={100}
								/> */}
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

export default followers;
