export const metadata = {
  title: "Login",
};

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F9F8]">
      <div className="card max-w-sm w-full mx-4">
        <h1 className="text-2xl font-bold text-fm-patina text-center mb-2">
          Fair Markets NY
        </h1>
        <p className="text-sm text-fm-sage text-center mb-6">
          Enter the password to continue.
        </p>

        <form action="/api/login" method="POST">
          <input type="hidden" name="next" value={next || "/"} />
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoFocus
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fm-teal focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">
              Incorrect password.
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-fm-patina text-white font-medium text-sm hover:bg-fm-patina/90 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
