/**
 * 颜色工具函数
 * 用于处理GitHub标签颜色和对比度计算
 */

/**
 * 将6字符十六进制颜色（不带#）转换为RGB值
 * @param hex 6字符十六进制颜色，例如 "0366d6"
 * @returns RGB对象 { r: number, g: number, b: number }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
	// 确保是6字符格式，去掉可能的#前缀
	const cleanHex = normalizeHexColor(hex);

	const r = Number.parseInt(cleanHex.substring(0, 2), 16);
	const g = Number.parseInt(cleanHex.substring(2, 4), 16);
	const b = Number.parseInt(cleanHex.substring(4, 6), 16);

	return { r, g, b };
}

/**
 * 计算颜色的相对亮度（WCAG标准）
 * @param hex 6字符十六进制颜色
 * @returns 亮度值（0-1之间）
 */
export function getLuminance(hex: string): number {
	const { r, g, b } = hexToRgb(hex);

	// 标准化RGB值到0-1范围
	const rsrgb = r / 255;
	const gsrgb = g / 255;
	const bsrgb = b / 255;

	// 应用伽马校正
	const rgamma =
		rsrgb <= 0.03928 ? rsrgb / 12.92 : ((rsrgb + 0.055) / 1.055) ** 2.4;
	const ggamma =
		gsrgb <= 0.03928 ? gsrgb / 12.92 : ((gsrgb + 0.055) / 1.055) ** 2.4;
	const bgamma =
		bsrgb <= 0.03928 ? bsrgb / 12.92 : ((bsrgb + 0.055) / 1.055) ** 2.4;

	// 计算相对亮度
	return 0.2126 * rgamma + 0.7152 * ggamma + 0.0722 * bgamma;
}

/**
 * 根据背景色选择最佳的文字颜色（黑色或白色）
 * 基于WCAG对比度标准，阈值设为0.179
 * @param backgroundColorHex 背景色（6字符十六进制）
 * @returns "#000000"（黑色）或 "#ffffff"（白色）
 */
export function getContrastColor(backgroundColorHex: string): string {
	const luminance = getLuminance(backgroundColorHex);
	// 阈值0.179是基于WCAG AA标准的选择
	return luminance > 0.179 ? "#000000" : "#ffffff";
}

/**
 * 规范化十六进制颜色格式
 * 确保返回6字符格式（不带#）
 * @param hex 颜色字符串，可能是3字符、6字符，可能带#前缀
 * @returns 6字符十六进制颜色（不带#）
 */
export function normalizeHexColor(hex: string): string {
	// 去掉可能的#前缀
	let cleanHex = hex.replace(/^#/, "");

	// 如果是3字符格式，扩展为6字符
	if (cleanHex.length === 3) {
		cleanHex = cleanHex
			.split("")
			.map((char) => char + char)
			.join("");
	}

	// 确保是6字符
	if (cleanHex.length !== 6) {
		// 如果不是标准格式，返回GitHub默认蓝色
		console.warn(
			`Invalid hex color format: "${hex}", using default GitHub blue`,
		);
		return "0366d6";
	}

	return cleanHex.toLowerCase();
}

/**
 * 检查颜色是否为浅色
 * @param hex 6字符十六进制颜色
 * @returns 如果是浅色返回true
 */
export function isLightColor(hex: string): boolean {
	return getLuminance(hex) > 0.179;
}

/**
 * 检查颜色是否为深色
 * @param hex 6字符十六进制颜色
 * @returns 如果是深色返回true
 */
export function isDarkColor(hex: string): boolean {
	return !isLightColor(hex);
}

/**
 * 为暗色模式调整颜色（降低亮度）
 * @param hex 原始颜色（6字符十六进制）
 * @param factor 调整因子（0-1，默认0.7）
 * @returns 调整后的颜色（6字符十六进制）
 */
export function darkenForDarkMode(hex: string, factor = 0.7): string {
	const { r, g, b } = hexToRgb(hex);

	const newR = Math.round(r * factor);
	const newG = Math.round(g * factor);
	const newB = Math.round(b * factor);

	// 转回十六进制
	const toHex = (n: number) => {
		const hex = n.toString(16);
		return hex.length === 1 ? `0${hex}` : hex;
	};

	return toHex(newR) + toHex(newG) + toHex(newB);
}
