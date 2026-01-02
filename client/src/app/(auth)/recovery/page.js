"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const RecoverAccount = () => {
	const [email, setEmail] = useState("");
	const router = useRouter();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (email.trim() === "") {
			alert("Please enter a valid email address.");
		} else {
			alert(`Recovery email submitted: ${email}`);
			router.push("/");
		}
	};

	return (
		<div className="flex justify-center items-center bg-green-200 h-screen w-screen">
			<div className="flex flex-col content-start items-start w-full max-w-xl p-6 bg-white rounded-sm shadow-md border-gray-200 border-2">
				<div className="flex gap-2 content-start  items-start w-full">
					<Link
						href="/"
						className="text-start flex content-start items-start w-1/5 text-2xl "
					>
						🔙
					</Link>
					<div className="flex flex-col gap-4">
						<h2 className="text-2xl font-bold  inline-block">
							Recover Account
						</h2>
						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-2 w-full"
						>
							<div className="flex flex-col gap-2">
								<label htmlFor="email">Enter your recovery email</label>
								<input
									className="p-2"
									type="email"
									name="email"
									placeholder="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<button
								type="submit"
								className="h-12 w-20 p-2 bg-red-600 rounded-md text-white"
							>
								Submit
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecoverAccount;
