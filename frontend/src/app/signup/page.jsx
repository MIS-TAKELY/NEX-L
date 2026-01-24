import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
