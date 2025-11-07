"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";

const RegistrationForm = () => {
  const router = useRouter();

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
          "http://localhost:8000/register",
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
        console.log("task completed")
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-200">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-md px-10 py-6 bg-white rounded shadow shadow-gray-400 transition 3s hover:shadow-md hover:shadow-black"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">Register</h2>

        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block mb-1 font-medium">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            className={`w-full px-3 py-2 border rounded ${
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

        {/* ✅ Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1 font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Choose a unique username"
            className={`w-full px-3 py-2 border rounded ${
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

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            className={`w-full px-3 py-2 border rounded ${
              formik.touched.password && formik.errors.password
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...formik.getFieldProps("password")}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            className={`w-full px-3 py-2 border rounded ${
              formik.touched.confirmPassword && formik.errors.confirmPassword
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...formik.getFieldProps("confirmPassword")}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {formik.errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 text-white bg-green-500 rounded hover:bg-green-600"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
