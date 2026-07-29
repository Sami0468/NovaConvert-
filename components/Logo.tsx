export default function NovaConvertIcon({ size = 70 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Dark Theme Gradient */}
        <linearGradient id="novaBg" x1="0" y1="0" x2="512" y2="512">
          <stop offset="0%" stopColor="#0a0f24" />
          <stop offset="50%" stopColor="#070b19" />
          <stop offset="100%" stopColor="#040610" />
        </linearGradient>

        {/* PDF File Gradients */}
        <linearGradient id="pdfBgGrad" x1="90" y1="120" x2="250" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff7360" />
          <stop offset="40%" stopColor="#e53935" />
          <stop offset="100%" stopColor="#9b1c2b" />
        </linearGradient>
        <linearGradient id="pdfFoldGrad" x1="200" y1="164" x2="248" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffbdaf" />
          <stop offset="100%" stopColor="#ff8575" />
        </linearGradient>
        
        {/* Word File Gradients */}
        <linearGradient id="wordBgGrad" x1="262" y1="120" x2="422" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4de1ff" />
          <stop offset="40%" stopColor="#1e88e5" />
          <stop offset="100%" stopColor="#0d47a1" />
        </linearGradient>
        <linearGradient id="wordFoldGrad" x1="374" y1="164" x2="422" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cceeff" />
          <stop offset="100%" stopColor="#7cd6ff" />
        </linearGradient>

        {/* Curved Arrows Gradients */}
        <linearGradient id="topArrowGrad" x1="210" y1="180" x2="330" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1976d2" />
          <stop offset="50%" stopColor="#03a9f4" />
          <stop offset="100%" stopColor="#26c6da" />
        </linearGradient>
        <linearGradient id="bottomArrowGrad" x1="180" y1="260" x2="300" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d32f2f" />
          <stop offset="60%" stopColor="#e91e63" />
          <stop offset="100%" stopColor="#7e1e43" />
        </linearGradient>

        {/* Text/Typography Gradients */}
        <linearGradient id="novaTextGrad" x1="80" y1="360" x2="432" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2979ff" />
          <stop offset="45%" stopColor="#00b0ff" />
          <stop offset="75%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#2effdf" />
        </linearGradient>

        <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2ef2ff" />
          <stop offset="100%" stopColor="#00bfff" />
        </linearGradient>

        {/* Drop Shadows for 3D realism */}
        <filter id="fileShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      {/* 1. Background Card */}
      <rect width="512" height="512" rx="96" fill="url(#novaBg)" />

      {/* 2. Top Center Sparkles */}
      <g transform="translate(240, 45)">
        <path d="M24 0L27 12L39 15L27 18L24 30L21 18L9 15L21 12L24 0Z" fill="url(#sparkleGrad)" />
        <path d="M7 17L8.2 22L13.2 23.2L8.2 24.4L7 29.4L5.8 24.4L0.8 23.2L5.8 22L7 17Z" fill="url(#sparkleGrad)" />
        <path d="M33 27L34 31L38 32L34 33L33 37L32 33L28 32L32 31L33 27Z" fill="url(#sparkleGrad)" />
      </g>

      {/* 3. Graphical Elements (Files & Arrows) */}
      <g filter="url(#fileShadow)">
        
        {/* --- LEFT FILE: PDF --- */}
        <path d="M90 148 C90 132 103 120 119 120 L202 120 L246 164 L246 312 C246 328 233 340 217 340 L119 340 C103 340 90 328 90 312 Z" fill="url(#pdfBgGrad)" />
        {/* Page Fold */}
        <path d="M202 120 L202 144 C202 155 211 164 222 164 L246 164 Z" fill="url(#pdfFoldGrad)" />
        {/* Adobe Vector Outline */}
        <path d="M178 174 C151 174 136 199 131 217 C142 211 160 206 172 206 C167 224 156 249 138 249 C131 249 124 242 124 231 C124 210 146 181 178 181 C192 181 214 188 225 199 C218 201 200 204 189 211 C196 229 209 242 220 242 C227 242 231 235 227 221 C222 203 203 174 178 174 Z M138 235 C143 235 152 221 158 208 C147 211 135 219 135 228 C135 233 137 235 138 235 Z M214 217 C203 210 194 203 185 199 C190 206 196 219 200 230 C207 226 212 221 214 217 Z" fill="#ffffff" fillRule="evenodd" opacity="0.95" />
        {/* PDF Label Text */}
        <text x="114" y="316" fill="#ffffff" fontSize="34" fontWeight="900" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letterSpacing="1">PDF</text>

        {/* --- EXCHANGE ARROWS --- */}
        {/* Top Blue Arrow */}
        <path d="M242 220 C242 182 278 162 312 176" stroke="url(#topArrowGrad)" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M298 152 L334 176 L298 200 Z" fill="url(#topArrowGrad)" />

        {/* Bottom Red/Pink Arrow */}
        <path d="M308 240 C308 278 272 298 238 284" stroke="url(#bottomArrowGrad)" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M252 308 L216 284 L252 260 Z" fill="url(#bottomArrowGrad)" />

        {/* --- RIGHT FILE: WORD --- */}
        <path d="M266 148 C266 132 279 120 295 120 L378 120 L422 164 L422 312 C422 328 409 340 393 340 L295 340 C279 340 266 328 266 312 Z" fill="url(#wordBgGrad)" />
        {/* Page Fold */}
        <path d="M378 120 L378 144 C378 155 387 164 398 164 L422 164 Z" fill="url(#wordFoldGrad)" />
        {/* 'W' Design Pattern */}
        <path d="M290 162 L302 202 L312 171 L323 202 L335 162 L348 162 L330 213 L319 213 L312 184 L305 213 L294 213 L276 162 Z" fill="#ffffff" opacity="0.95" />
        {/* Lines Layout */}
        <rect x="290" y="234" width="102" height="11" rx="5.5" fill="#ffffff" opacity="0.85" />
        <rect x="290" y="260" width="102" height="11" rx="5.5" fill="#ffffff" opacity="0.85" />
        <rect x="290" y="286" width="72" height="11" rx="5.5" fill="#ffffff" opacity="0.85" />

      </g>

      {/* 4. Typography Content */}
      {/* Title Text: NOVA */}
      <text
        x="256"
        y="418"
        fill="url(#novaTextGrad)"
        fontSize="82"
        fontWeight="900"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="10"
      >
        NOVA
      </text>

      {/* Tiny Sparkle on 'A' letter corner */}
      <path d="M424 396L427 403L434 405L427 407L424 414L421 407L414 405L421 403L424 396Z" fill="#2effdf" />

      {/* Subtitle Text: CONVERT */}
      <text
        x="262"
        y="464"
        fill="#ffffff"
        opacity="0.95"
        fontSize="34"
        fontWeight="300"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="24"
      >
        CONVERT
      </text>

      {/* 5. Tagline & Alignment Accent Lines */}
      {/* Left Accent Cyan line */}
      <path d="M80 492 L140 492" stroke="url(#topArrowGrad)" strokeWidth="3" strokeLinecap="round" />
      
      {/* Footer Text */}
      <text
        x="256"
        y="496"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="15"
        fontWeight="600"
        textAnchor="middle"
        letterSpacing="1"
      >
        <tspan fill="#00c8ff">Convert.</tspan>
        <tspan fill="#64ffda"> Simplify.</tspan>
        <tspan fill="#ff5252"> Save Time.</tspan>
      </text>

      {/* Right Accent Pink line */}
      <path d="M372 492 L432 492" stroke="url(#bottomArrowGrad)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}