import { ImageResponse } from 'next/og';

// Static link-unfurl card (LinkedIn / iMessage / X). On-brand with the portfolio palette + orbit motif.
export const alt = 'Timmy — Systems & Automation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'radial-gradient(120% 120% at 80% 10%, #0b0f1a 0%, #05060a 60%)',
          color: '#eaedf7',
          fontFamily: 'sans-serif',
        }}
      >
        {/* orbit glyph */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="88" height="88" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#05060a" />
            <ellipse cx="16" cy="16" rx="10" ry="10" stroke="#6e8bff" strokeOpacity="0.45" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="3.5" fill="#6e8bff" />
            <circle cx="26" cy="16" r="2.5" fill="#38e0c0" />
          </svg>
          <span style={{ marginLeft: 24, fontSize: 26, letterSpacing: 4, color: '#818aa6' }}>
            PORTFOLIO
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            <span>Timmy — Systems</span>
            <span>& Automation</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: '#818aa6', maxWidth: 880 }}>
            I build the systems and automations that keep businesses running.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
