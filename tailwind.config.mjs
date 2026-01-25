/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Source Han Sans SC"', '"Noto Sans SC"', '"思源黑体"', 'sans-serif'],
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
