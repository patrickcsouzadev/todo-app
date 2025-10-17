const nextConfig = {
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
					}
				]
			}
		]
	},
	async redirects() {
		return [
			{ source: '/login', destination: '/auth/login', permanent: false },
			{ source: '/register', destination: '/auth/register', permanent: false },
			{ source: '/confirm', destination: '/auth/confirm', permanent: false },
			{ source: '/reset-password', destination: '/auth/reset', permanent: false },
			{ source: '/auth/reset-password', destination: '/auth/reset', permanent: false },
			{ source: '/request-reset', destination: '/auth/request-reset', permanent: false },
		]
	},
}
module.exports = nextConfig