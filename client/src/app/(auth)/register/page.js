"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegistrationForm = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
	// ✅ Validation schema (added username validation)
	const validationSchema = Yup.object({
		fullName: Yup.string().required("Full Name is required"),
		username: Yup.string()
			.matches(
				/^[a-zA-Z0-9_]+$/,
				"Only letters, numbers, and underscores allowed"
			)
			.min(3, "Username must be at least 3 characters")
			.max(20, "Username must be less than 20 characters")
			.required("Username is required"),
		email: Yup.string()
			.email("Invalid email address")
			.required("Email is required"),
		password: Yup.string()
			.min(8, "Password must be at least 8 characters")
			.required("Password is required"),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref("password"), null], "Passwords must match")
			.required("Confirm password is required"),
	});

	// ✅ Formik setup
	const formik = useFormik({
		initialValues: {
			fullName: "",
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validationSchema,
		onSubmit: async (values, { resetForm }) => {
			try {
				const response = await axios.post(
					`${NEXT_PUBLIC_API_URL}/register`,
					values
				);
				console.log("Response Data:", response.data);
				alert("Registration Successful!");
				router.push("./login");
				resetForm();
			} catch (error) {
				console.error(
					"Error during registration:",
					error.response?.data || error?.msg
				);
				alert(
					error.response?.data?.msg || "Registration failed. Please try again."
				);
			} finally {
				console.log("task completed");
			}
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-sm px-4">
			<form
				onSubmit={formik.handleSubmit}
				className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 px-8 py-8 sm:px-10 sm:py-10 transition-all duration-300 hover:shadow-2xl"
			>
				<h2 className="mb-8 text-3xl font-bold text-center text-gray-800">
					Register
				</h2>

				<div className="flex flex-wrap gap-6">
					{/* Full Name */}
					<div className="flex-1 min-w-[250px]">
						<label
							htmlFor="fullName"
							className="block mb-2 font-medium text-gray-700"
						>
							Full Name
						</label>
						<input
							type="text"
							id="fullName"
							name="fullName"
							placeholder="Enter your full name"
							className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-300 ${
								formik.touched.fullName && formik.errors.fullName
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("fullName")}
						/>
						{formik.touched.fullName && formik.errors.fullName && (
							<p className="mt-1 text-xs text-red-500">
								{formik.errors.fullName}
							</p>
						)}
					</div>

					{/* Username */}
					<div className="flex-1 min-w-[250px]">
						<label
							htmlFor="username"
							className="block mb-2 font-medium text-gray-700"
						>
							Username
						</label>
						<input
							type="text"
							id="username"
							name="username"
							placeholder="Choose a unique username"
							className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-300 ${
								formik.touched.username && formik.errors.username
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("username")}
						/>
						{formik.touched.username && formik.errors.username && (
							<p className="mt-1 text-xs text-red-500">
								{formik.errors.username}
							</p>
						)}
					</div>

					{/* Email */}
					<div className="w-full">
						<label
							htmlFor="email"
							className="block mb-2 font-medium text-gray-700"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="Enter your email"
							className={`w-[48%] px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-300 ${
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

					{/* Password */}
					<div className="flex-1 min-w-[250px] relative">
						<label
							htmlFor="password"
							className="block mb-2 font-medium text-gray-700"
						>
							Password
						</label>

						<input
							type={showPassword ? "text" : "password"}
							id="password"
							name="password"
							placeholder="Enter your password"
							className={`w-full px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-300 ${
								formik.touched.password && formik.errors.password
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("password")}
						/>

						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute right-3 top-[38px] text-sm text-gray-500 hover:text-gray-700"
						>
							{showPassword ? "Hide" : "Show"}
						</button>

						{formik.touched.password && formik.errors.password && (
							<p className="mt-1 text-xs text-red-500">
								{formik.errors.password}
							</p>
						)}
					</div>
					<div className="flex-1 min-w-[250px] relative">
						<label
							htmlFor="confirmPassword"
							className="block mb-2 font-medium text-gray-700"
						>
							Confirm Password
						</label>

						<input
							type={showConfirmPassword ? "text" : "password"}
							id="confirmPassword"
							name="confirmPassword"
							placeholder="Confirm your password"
							className={`w-full px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-300 ${
								formik.touched.confirmPassword && formik.errors.confirmPassword
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("confirmPassword")}
						/>

						<button
							type="button"
							onClick={() => setShowConfirmPassword((prev) => !prev)}
							className="absolute right-3 top-[38px] text-sm text-gray-500 hover:text-gray-700"
						>
							{showConfirmPassword ? "Hide" : "Show"}
						</button>

						{formik.touched.confirmPassword &&
							formik.errors.confirmPassword && (
								<p className="mt-1 text-xs text-red-500">
									{formik.errors.confirmPassword}
								</p>
							)}
					</div>
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					className="mt-8 w-full py-3 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-70"
					disabled={formik.isSubmitting}
				>
					{formik.isSubmitting ? "Submitting..." : "Register"}
				</button>

				{/* Additional Links */}
				<div className="mt-6 text-center text-gray-600 text-sm">
					<p>
						Already have an account?{" "}
						<Link href="/login" className="text-blue-500 hover:underline">
							Sign In
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};

export default RegistrationForm;
