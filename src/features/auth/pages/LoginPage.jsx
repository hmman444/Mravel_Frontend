import React, { useState } from 'react'
import bg from "../../../assets/mountain-bg.jpg"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ email, password })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Nội dung chia 2 cột */}
      <div className="relative z-10 flex w-full max-w-7xl px-6 md:px-12 lg:px-20">
        {/* Cột trái: Slogan */}
        <div className="flex-1 flex items-center">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
            Du Lịch Tự Do
            <br />
            Trọn Vẹn Hành Trình
          </h1>
        </div>

        {/* Cột phải: Form */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
          <a href="#" className="text-sm text-gray-600 mb-4 inline-block">
            ← Vào Trang chủ
          </a>

          <h2 className="text-2xl font-bold text-blue-700 mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your email and password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-600">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </label>

            <label className="block">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Password</span>
                <a href="#" className="text-sm text-blue-500">Forgot password?</a>
              </div>
              <div className="relative mt-1">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={show ? 'text' : 'password'}
                  required
                  className="block w-full px-4 py-2 border border-gray-200 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold"
            >
              Sign in
            </button>
          </form>

          <div className="flex items-center mt-6">
            <hr className="flex-grow border-gray-200" />
            <span className="mx-4 text-xs text-gray-400">Or Login With</span>
            <hr className="flex-grow border-gray-200" />
          </div>

          <div className="flex gap-4 mt-4 justify-center">
            <button className="w-10 h-10 rounded-full border flex items-center justify-center">G</button>
            <button className="w-10 h-10 rounded-full border flex items-center justify-center">f</button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account? <a href="#" className="text-blue-500">Register now</a>
          </p>
        </div>
      </div>
    </div>
  )
}
