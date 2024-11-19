function rgbToHex({ r, g, b, a }) {
	const [rr, gg, bb, aa] = [r, g, b, Math.round(a * 255)].map((v) =>
		v.toString(16).padStart(2, "0")
	);
	return ["#", rr, gg, bb, aa === "ff" ? "" : aa].join("");
}

function hsvToRgb({ h, s, v }) {
	s /= 100;
	v /= 100;
	const i = ~~(h / 60);
	const f = h / 60 - i;
	const p = v * (1 - s);
	const q = v * (1 - s * f);
	const t = v * (1 - s * (1 - f));
	const index = i % 6;
	const r = [v, q, p, p, t, v][index] * 255;
	const g = [t, v, v, q, p, p][index] * 255;
	const b = [p, p, t, v, v, q][index] * 255;
	return { r, g, b };
}

function rgbToHsv({ r, g, b }) {
	const max = Math.max(r, g, b);
	const d = max - Math.min(r, g, b);

	if (d === 0) {
		return {
			h: 0,
			s: max ? d / max : 0,
			v: max,
		};
	}
	let h = 0;
	switch (max) {
		case r:
			h = (g - b) / d + (g < b ? 6 : 0);
			break;
		case g:
			h = 2 + (b - r) / d;
			break;
		case b:
			h = 4 + (r - g) / d;
			break;
	}
	return {
		h: h * 60,
		s: max ? d / max : 0,
		v: max,
	};
}

