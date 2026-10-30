
import { useState } from 'react';

const DEMO_WORKERS = [
  {
    email: 'worker1@mendx.demo',
    password: 'Worker@123',
    name: 'Aman Singh',
  },
  {
    email: 'worker2@mendx.demo',
    password: 'Worker@456',
    name: 'Priya Sharma',
  },
  {
    email: 'worker3@mendx.demo',
    password: 'Worker@789',
    name: 'Rahul Kumar',
  },
];

export default function WorkerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const worker = DEMO_WORKERS.find(
      (item) =>
        item.email === email.trim().toLowerCase() &&
        item.password === password
    );

    if (!worker) {
      setError('Invalid demo email or password.');
      setLoading(false);
      return;
    }

    sessionStorage.setItem(
      'mendxDemoWorker',
      JSON.stringify({
        name: worker.name,
        email: worker.email,
        role: 'worker',
        demoMode: true,
      })
    );

    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-3xl border border-white bg-white p-8 shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-700">
            Mendx Pro
          </h1>
          <p className="mt-2 text-gray-500">
            Welcome back, service professional!
          </p>
          <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            DEMO MODE
          </span>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter demo email"
            autoComplete="username"
            required
            className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter demo password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 p-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In to Mendx Pro'}
        </button>

        <div className="rounded-xl bg-gray-50 p-4">
          <h2 className="mb-3 text-sm font-bold text-gray-700">
            Demo Credentials
          </h2>

          {DEMO_WORKERS.map((worker, index) => (
            <button
              key={worker.email}
              type="button"
              onClick={() => {
                setEmail(worker.email);
                setPassword(worker.password);
                setError('');
              }}
              className="mb-2 w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
            >
              <span className="block text-sm font-semibold text-gray-800">
                Worker {index + 1}: {worker.name}
              </span>
              <span className="text-xs text-gray-500">
                {worker.email}
              </span>
              <span className="mt-1 block text-xs font-medium text-blue-700">
                Click to autofill credentials
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400">
          Frontend-only demo · No backend required
        </p>
      </form>
    </div>
  );
}
