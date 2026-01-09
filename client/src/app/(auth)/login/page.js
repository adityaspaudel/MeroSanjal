"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginForm = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);

	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

	const validationSchema = Yup.object({
		email: Yup.string()
			.email("Invalid email address")
			.required("Email is required"),
		password: Yup.string()
			.min(8, "Password must be at least 8 characters")
			.required("Password is required"),
	});

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema,
		onSubmit: async (values, { resetForm }) => {
			try {
				const response = await fetch(`${NEXT_PUBLIC_API_URL}/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(values),
				});

				const data = await response.json();

				if (response.ok) {
					if (data.token) localStorage.setItem("token", data.token);
					if (data.user?.id) localStorage.setItem("id", data.user.id);

					alert("Login successful!");
					resetForm();
					router.push(`/${data.user.id}/home`);
				} else {
					alert(data.message || "Login failed");
				}
			} catch (error) {
				console.error(error);
				alert("Something went wrong");
			}
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-gray-900">
			<form
				onSubmit={formik.handleSubmit}
				className="w-full max-w-md p-8 bg-gray-100 rounded-xl shadow-2xl border border-gray-300"
			>
				<h2 className="mb-6 text-3xl font-bold text-center text-green-900">
					Welcome Back
				</h2>

				{/* Email */}
				<div className="mb-4">
					<label className="block mb-1 text-sm font-medium text-gray-700">
						Email
					</label>
					<input
						type="email"
						placeholder="you@example.com"
						className={`w-full px-4 py-2 rounded-md bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-green-700 ${
							formik.touched.email && formik.errors.email
								? "border-red-500"
								: "border-gray-300"
						}`}
						{...formik.getFieldProps("email")}
					/>
					{formik.touched.email && formik.errors.email && (
						<p className="mt-1 text-xs text-red-600">
							{formik.errors.email}
						</p>
					)}
				</div>

				{/* Password */}
				<div className="mb-5">
					<label className="block mb-1 text-sm font-medium text-gray-700">
						Password
					</label>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							className={`w-full px-4 py-2 pr-12 rounded-md bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-green-700 ${
								formik.touched.password && formik.errors.password
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("password")}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-green-800 transition"
						>
							{showPassword ? "show" : "hide"}
						</button>
					</div>
					{formik.touched.password && formik.errors.password && (
						<p className="mt-1 text-xs text-red-600">
							{formik.errors.password}
						</p>
					)}
				</div>

				{/* Button */}
				<button
					type="submit"
					disabled={formik.isSubmitting}
					className="w-full py-2.5 rounded-md text-white font-semibold bg-green-800 hover:bg-green-900 transition-all disabled:opacity-60"
				>
					{formik.isSubmitting ? "Logging in..." : "Login"}
				</button>

				{/* Links */}
				<div className="mt-5 text-center text-sm text-gray-700">
					<p>
						<Link
							href="/recovery"
							className="text-green-800 hover:underline"
						>
							Recover Account
						</Link>
					</p>
					<p className="mt-2">
						Don’t have an account?{" "}
						<Link
							href="/register"
							className="text-green-800 font-medium hover:underline"
						>
							Sign Up
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
