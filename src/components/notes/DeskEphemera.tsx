/**
 * Restrained "desk" marks that fill the empty canvas regions and add
 * personality — drawn in faint pen ink, sitting behind the notes.
 * Purely decorative: pointer-events-none, aria-hidden.
 */
export default function DeskEphemera() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
      {/* hand-drawn pen ring (a compass-circle doodle), lower-center void */}
      <svg
        className="absolute"
        style={{ left: '41%', top: '70%', width: 150, height: 150, opacity: 0.16 }}
        viewBox="0 0 150 150"
        fill="none"
      >
        <path
          d="M75 8 C 110 6 144 38 142 76 C 140 116 106 144 70 142 C 33 140 7 107 9 70 C 11 36 41 10 78 9"
          stroke="#2D4F9E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* little asterisk / spark doodle, upper-left void */}
      <svg
        className="absolute -rotate-6"
        style={{ left: '30%', top: '11%', width: 46, height: 46, opacity: 0.22 }}
        viewBox="0 0 46 46"
        fill="none"
        stroke="#2D4F9E"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M23 6 V40 M8 14 L38 32 M38 14 L8 32" />
      </svg>

      {/* underline squiggle, lower-left */}
      <svg
        className="absolute rotate-3"
        style={{ left: '11%', top: '58%', width: 120, height: 18, opacity: 0.18 }}
        viewBox="0 0 120 18"
        fill="none"
        stroke="#2D4F9E"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M3 9 C 18 2 30 16 45 9 C 60 2 72 16 87 9 C 100 3 110 14 117 9" />
      </svg>

      {/* tiny scattered dots for texture */}
      <span
        className="absolute rounded-full"
        style={{ left: '64%', top: '24%', width: 5, height: 5, background: '#2D4F9E', opacity: 0.18 }}
      />
      <span
        className="absolute rounded-full"
        style={{ left: '47%', top: '46%', width: 4, height: 4, background: '#2D4F9E', opacity: 0.14 }}
      />
      <span
        className="absolute rounded-full"
        style={{ left: '88%', top: '52%', width: 5, height: 5, background: '#2D4F9E', opacity: 0.16 }}
      />
    </div>
  );
}
