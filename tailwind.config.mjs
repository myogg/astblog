/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Microsoft YaHei', '微软雅黑', 'sans-serif'],
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
