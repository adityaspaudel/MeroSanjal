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
		email: Yup.string().email("Invalid email").required("Email is required"),
		password: Yup.string().min(8).required("Password is required"),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref("password")], "Passwords must match")
			.required("Confirm password is required"),
	});

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
				await axios.post(`${NEXT_PUBLIC_API_URL}/register`, values);
				alert("Registration Successful!");
				router.push("/login");
				resetForm();
			} catch (error) {
				alert(error.response?.data?.msg || "Registration failed");
			}
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-gray-900 px-4">
			<form
				onSubmit={formik.handleSubmit}
				className="w-full max-w-4xl bg-gray-100 rounded-2xl shadow-2xl border border-gray-300 px-8 py-10"
			>
				<h2 className="mb-10 text-3xl font-bold text-center text-green-900">
					Create Your Account
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Full Name */}
					<div>
						<label className="block mb-2 text-sm font-medium text-gray-700">
							Full Name
						</label>
						<input
							type="text"
							placeholder="John Doe"
							className={`w-full px-4 py-2 rounded-md bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-green-700 ${
								formik.touched.fullName && formik.errors.fullName
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("fullName")}
						/>
						{formik.touched.fullName && formik.errors.fullName && (
							<p className="mt-1 text-xs text-red-600">
								{formik.errors.fullName}
							</p>
						)}
					</div>

					{/* Username */}
					<div>
						<label className="block mb-2 text-sm font-medium text-gray-700">
							Username
						</label>
						<input
							type="text"
							placeholder="john_doe"
							className={`w-full px-4 py-2 rounded-md bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-green-700 ${
								formik.touched.username && formik.errors.username
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("username")}
						/>
						{formik.touched.username && formik.errors.username && (
							<p className="mt-1 text-xs text-red-600">
								{formik.errors.username}
							</p>
						)}
					</div>

					{/* Email */}
					<div className="md:col-span-2">
						<label className="block mb-2 text-sm font-medium text-gray-700">
							Email
						</label>
						<input
							type="email"
							placeholder="youremail@example.com"
							className={`w-full px-4 py-2 rounded-md bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-green-700 ${
								formik.touched.email && formik.errors.email
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("email")}
						/>
						{formik.touched.email && formik.errors.email && (
							<p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
						)}
					</div>

					{/* Password */}
					<div className="relative">
						<label className="block mb-2 text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							type={showPassword ? "text" : "password"}
							placeholder="••••••••••••"
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
							className="absolute right-3 top-9 text-gray-600 hover:text-green-800"
						>
							{showPassword ? "show" : "hide"}
						</button>
						{formik.touched.password && formik.errors.password && (
							<p className="mt-1 text-xs text-red-600">
								{formik.errors.password}
							</p>
						)}
					</div>

					{/* Confirm Password */}
					<div className="relative">
						<label className="block mb-2 text-sm font-medium text-gray-700">
							Confirm Password
						</label>
						<input
							type={showConfirmPassword ? "text" : "password"}
							placeholder="••••••••••••"
							className={`w-full px-4 py-2 pr-12 rounded-md bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-green-700 ${
								formik.touched.confirmPassword && formik.errors.confirmPassword
									? "border-red-500"
									: "border-gray-300"
							}`}
							{...formik.getFieldProps("confirmPassword")}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-9 text-gray-600 hover:text-green-800"
						>
							{showConfirmPassword ? "show" : "hide"}
						</button>
						{formik.touched.confirmPassword &&
							formik.errors.confirmPassword && (
								<p className="mt-1 text-xs text-red-600">
									{formik.errors.confirmPassword}
								</p>
							)}
					</div>
				</div>

				<button
					type="submit"
					disabled={formik.isSubmitting}
					className="mt-10 w-full py-3 rounded-md bg-green-800 text-white font-semibold hover:bg-green-900 transition disabled:opacity-60"
				>
					{formik.isSubmitting ? "Creating Account..." : "Register"}
				</button>

				<div className="mt-6 text-center text-sm text-gray-700">
					Already have an account?{" "}
					<Link
						href="/login"
						className="text-green-800 font-medium hover:underline"
					>
						Sign In
					</Link>
				</div>
			</form>
		</div>
	);
};

export default RegistrationForm;
