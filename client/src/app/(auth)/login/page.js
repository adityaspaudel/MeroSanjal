"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginForm = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);

	// Validation Schema
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
				const response = await fetch("http://localhost:8000/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				});

				const data = await response.json();

				console.log("Response Data:", data);
				// for understanding
				// Check for success status before proceeding
				if (response.ok) {
					// Store token and userId (as id) in localStorage if available
					if (data.token) {
						localStorage.setItem("token", data.token);
					}
					if (data.user && data.user.id) {
						localStorage.setItem("id", data.user.id); // Store userId as 'id' in localStorage
					}

					alert("Login successful!");
					resetForm();
					console.log(data.user.id);
					router.push(`/${data.user.id}/home`);
					// Redirect to home page
				} else {
					// Show error message from the response
					alert(data.message || "Login failed. Please try again.");
				}
			} catch (error) {
				console.error("Error during login:", error);
				alert("An error occurred. Please try again.");
			}
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-400  to-green-600">
			<form
				onSubmit={formik.handleSubmit}
				className="w-full max-w-md p-6 bg-white rounded-sm shadow shadow-gray-200 transition 3s hover:shadow-black"
			>
				<h2 className="mb-6 text-2xl font-bold text-center">Login</h2>

				{/* Email Input */}
				<div className="mb-4">
					<label htmlFor="email" className="block mb-1 font-medium">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						placeholder="Enter your email"
						className={`w-full px-3 py-2 border rounded ${
							formik.touched.email && formik.errors.email
								? "border-red-500"
								: "border-gray-300"
						}`}
						{...formik.getFieldProps("email")}
					/>
					{formik.touched.email && formik.errors.email && (
						<p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
					)}
				</div>

				{/* Password Input with Visibility Toggle */}
				<div className="mb-4">
					<label htmlFor="password" className="block mb-1 font-medium">
						Password
					</label>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							id="password"
							name="password"
							placeholder="Enter your password"
							className={`w-full px-3 py-2 border rounded pr-10 ${
								formik.touched.password && formik.errors.password
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("password")}
						/>
						<button
							type="button"
							className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? "🙈" : "👁️"}
						</button>
					</div>
					{formik.touched.password && formik.errors.password && (
						<p className="mt-1 text-xs text-red-500">
							{formik.errors.password}
						</p>
					)}
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					className="w-full py-2 text-white bg-green-500 rounded hover:bg-green-600"
					disabled={formik.isSubmitting}
				>
					{formik.isSubmitting ? "Logging in..." : "Login"}
				</button>

				{/* Additional Links */}
				<div className="mt-4 text-center">
					<p className="text-sm">
						<Link href="/recovery" className="text-blue-500 hover:underline">
							Recover Account
						</Link>
					</p>
					<p className="mt-2 text-sm">
						Dont have an account?{" "}
						<Link href="/register" className="text-blue-500 hover:underline">
							Sign Up
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
