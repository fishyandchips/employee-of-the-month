import { useForm } from 'react-hook-form';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const { register, handleSubmit, formState: { errors }} = useForm({
		mode: "onSubmit",
		defaultValues: {
		email: "",
		password: ""
		}
	});

  const onSubmit = async ({ email, password }) => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
				email,
				password
			},
			{
				withCredentials: true
			});

			setError("");
			navigate("/directory");
		} catch (err) {
			setError(err.response.data.error);
			console.log(err.response.data.error);
		}
  }

	return (
		<div className="flex flex-col w-full h-full justify-center items-center gap-10">
			<h1 className="font-bold text-xl">Login</h1>

			<form 
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center w-[30%] gap-5"
      >
				<div className="flex flex-col w-full gap-4 mb-16">
					{error && (
						<div className="p-4 text-red-700 bg-red-100 rounded-md">
							Error: {error}
						</div>
					)}

					<input
						{...register("email", {
						required: "Email is required",
						pattern: {
							value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							message: "Invalid email address"
						}
						})}
						type="email" 
						id="email" 
						className={`px-5 py-3 rounded-md border ${errors.email && "border-[#FF7F7F]"}`}
						placeholder="Enter your email address"
					/>
					{errors.email && (
						<p className="text-[#FF7F7F] text-[0.8rem]">{errors.email.message}</p>
					)}

					<input
						{...register("password", {
							required: "Password is required"
						})}
						type="password" 
						id="password"
						className={`px-5 py-3 rounded-md border ${errors.password && "border-[#FF7F7F]"}`}
						placeholder="Enter your password"
					/>
					{errors.password && (
						<p className="text-[#FF7F7F] text-[0.8rem]">{errors.password.message}</p>
					)}

					<button 
						className="w-full p-4 rounded-full cursor-pointer bg-[#A3CBFF] hover:bg-[#A3CBFF]/80 text-black disabled:opacity-50 disabled:cursor-not-allowed" 
						type="submit"
					>
						Sign in
					</button>
				</div>
			</form>
		</div>
	)
}

export default Login;
