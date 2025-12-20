import nammaqa from '../assets/nammaqa.jpg'
const LoginPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {/* Logo */}
                <div className="flex justify-center mb-2">
                    <img
                        src={nammaqa}
                        alt="Logo"
                        className="h-12 w-auto"
                    />
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Enquiry Portal
                </h2>
                <p className="text-sm text-center text-gray-500 mb-6">
                    Please sign in to your account
                </p>

                {/* Form */}
                <form className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <a
                            href="#"
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white
            font-semibold py-2.5 rounded-lg transition duration-200 shadow-md"
                    >
                        Sign In
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    Don’t have an account?{" "}
                    <a href="#" className="text-indigo-600 font-medium hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
