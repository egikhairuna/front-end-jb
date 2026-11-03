import React from 'react'

// ─── ISO Care SVG Icons (24×24, stroke-based, consistent weight) ──────────────

const Wash30MildIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <path d="M3.5 8.5 L4.8 15 C5.1 17 6.8 18 9.5 18 H14.5 C17.2 18 18.9 17 19.2 15 L20.5 8.5" />
    <path d="M3.5 8.5 C5.2 7 7 10 9 8.5 C11 7 13 10 15 8.5 C17 7 18.8 10 20.5 8.5" />
    <text x="12" y="14.8" fontSize="5.5" fill="currentColor" stroke="none" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">30</text>
    <line x1="5.5" y1="20.5" x2="18.5" y2="20.5" strokeWidth="1.25" />
  </svg>
)

const WashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <path d="M3.5 8.5 L4.8 15 C5.1 17 6.8 18 9.5 18 H14.5 C17.2 18 18.9 17 19.2 15 L20.5 8.5" />
    <path d="M3.5 8.5 C5.2 7 7 10 9 8.5 C11 7 13 10 15 8.5 C17 7 18.8 10 20.5 8.5" />
  </svg>
)

const DoNotWashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <path d="M3.5 8.5 L4.8 15 C5.1 17 6.8 18 9.5 18 H14.5 C17.2 18 18.9 17 19.2 15 L20.5 8.5" />
    <path d="M3.5 8.5 C5.2 7 7 10 9 8.5 C11 7 13 10 15 8.5 C17 7 18.8 10 20.5 8.5" />
    <line x1="5.5" y1="6.5" x2="18.5" y2="18.5" strokeWidth="1.3" />
    <line x1="18.5" y1="6.5" x2="5.5" y2="18.5" strokeWidth="1.3" />
  </svg>
)

const DoNotBleachIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <polygon points="12,4 21,19 3,19" />
    <line x1="6" y1="7.5" x2="18" y2="18.5" strokeWidth="1.3" />
    <line x1="18" y1="7.5" x2="6" y2="18.5" strokeWidth="1.3" />
  </svg>
)

const DoNotTumbleDryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <rect x="3.5" y="3.5" width="17" height="17" rx="0.5" />
    <circle cx="12" cy="12" r="6" />
    <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" strokeWidth="1.3" />
    <line x1="20.5" y1="3.5" x2="3.5" y2="20.5" strokeWidth="1.3" />
  </svg>
)

const Iron110Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <path d="M3.5 17.5 H19.5 C19 14 16 11 12 11 H3.5 V17.5 Z" />
    <path d="M5.5 11 V7.5 H12 C14 7.5 15 9 15.5 11" />
    <circle cx="10" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

const DoNotIronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <path d="M3.5 17.5 H19.5 C19 14 16 11 12 11 H3.5 V17.5 Z" />
    <path d="M5.5 11 V7.5 H12 C14 7.5 15 9 15.5 11" />
    <line x1="5" y1="5.5" x2="19" y2="19" strokeWidth="1.3" />
    <line x1="19" y1="5.5" x2="5" y2="19" strokeWidth="1.3" />
  </svg>
)

const DoNotDryCleanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <circle cx="12" cy="12" r="7.5" />
    <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" strokeWidth="1.3" />
    <line x1="17.5" y1="6.5" x2="6.5" y2="17.5" strokeWidth="1.3" />
  </svg>
)

const WetCleanMildIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <circle cx="12" cy="10" r="7.5" />
    <path d="M8.2 7.2 L9.8 12.8 L12 8.5 L14.2 12.8 L15.8 7.2" strokeWidth="1.25" />
    <line x1="6.5" y1="20" x2="17.5" y2="20" strokeWidth="1.25" />
  </svg>
)

const FlatDryInShadeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <rect x="3.5" y="3.5" width="17" height="17" rx="0.5" />
    <line x1="3.5" y1="8.5" x2="8.5" y2="3.5" strokeWidth="1.25" />
    <line x1="3.5" y1="12" x2="20.5" y2="12" strokeWidth="1.25" />
  </svg>
)

const FlatDryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <rect x="3.5" y="3.5" width="17" height="17" rx="0.5" />
    <line x1="6" y1="12" x2="18" y2="12" strokeWidth="1.25" />
  </svg>
)

const LineDryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <rect x="3.5" y="3.5" width="17" height="17" rx="0.5" />
    <line x1="12" y1="6" x2="12" y2="18" strokeWidth="1.25" />
  </svg>
)

const LineDryInShadeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <rect x="3.5" y="3.5" width="17" height="17" rx="0.5" />
    <line x1="3.5" y1="8.5" x2="8.5" y2="3.5" strokeWidth="1.25" />
    <line x1="12" y1="6" x2="12" y2="18" strokeWidth="1.25" />
  </svg>
)

const RemoveAccessoriesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
    <circle cx="8" cy="16" r="2.5" />
    <circle cx="8" cy="8" r="2.5" />
    <line x1="10" y1="14.5" x2="19" y2="5.5" />
    <line x1="10" y1="9.5" x2="19" y2="18.5" />
  </svg>
)

const DefaultBulletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="w-5 h-5 shrink-0">
    <circle cx="17" cy="12" r="2.5" fill="currentColor" />
  </svg>
)

// ─── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*[\/]?>/gi, '|')
    .replace(/<\/p>/gi, '|')
    .replace(/<\/li>/gi, '|')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&deg;/g, '°')
    .replace(/&#176;/g, '°')
    .trim()
}

function parseCareInstructions(shortDescription: string): string[] {
  const text = stripHtml(shortDescription)
  return text
    .split(/[|\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function matchCareIcon(instruction: string): React.ReactNode | null {
  const lower = instruction.toLowerCase()

  // 1. Wash
  if (lower.includes('do not wash') || lower.includes('no wash')) {
    return <DoNotWashIcon />
  }
  if (lower.includes('30') || lower.includes('mild')) {
    return <Wash30MildIcon />
  }
  if (lower.includes('wash') || lower.includes('cold')) {
    return <WashIcon />
  }

  // 2. Bleach
  if (lower.includes('bleach')) {
    return <DoNotBleachIcon />
  }

  // 3. Tumble dry
  if (lower.includes('tumble')) {
    return <DoNotTumbleDryIcon />
  }

  // 4. Iron
  if (lower.includes('do not iron') || lower.includes('no iron')) {
    return <DoNotIronIcon />
  }
  if (lower.includes('iron')) {
    return <Iron110Icon />
  }

  // 5. Dry clean
  if (lower.includes('dry clean') || lower.includes('dryclean') || lower.includes('dry-clean')) {
    return <DoNotDryCleanIcon />
  }

  // 6. Professional wet clean
  if (lower.includes('wet clean') || lower.includes('wetclean') || lower.includes('wet-clean')) {
    return <WetCleanMildIcon />
  }

  // 7. Flat dry / Shade
  if (lower.includes('shade') && (lower.includes('flat') || lower.includes('dry'))) {
    return <FlatDryInShadeIcon />
  }
  if (lower.includes('flat dry') || lower.includes('dry flat')) {
    return <FlatDryIcon />
  }

  // 8. Line dry
  if (lower.includes('line dry') || lower.includes('hang dry') || lower.includes('hang to dry')) {
    if (lower.includes('shade')) {
      return <LineDryInShadeIcon />
    }
    return <LineDryIcon />
  }

  // 9. Accessories
  if (lower.includes('accessories') || lower.includes('detachable')) {
    return <RemoveAccessoriesIcon />
  }

  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CareIconsProps {
  shortDescription: string
}

export function CareIcons({ shortDescription }: CareIconsProps) {
  if (!shortDescription) {
    return (
      <p className="text-[14px] leading-snug text-black/70">
        Machine wash cold. Do not tumble dry.
      </p>
    )
  }

  const instructions = parseCareInstructions(shortDescription)
  const items = instructions.map((inst) => ({
    text: inst,
    icon: matchCareIcon(inst),
  }))

  const matchedCount = items.filter((x) => x.icon !== null).length

  // Fallback if no care instruction matched
  if (matchedCount === 0) {
    return (
      <div
        className="text-[14px] leading-snug text-black/80 [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: shortDescription }}
      />
    )
  }

  return (
    <div className="flex flex-col space-y-4 py-1">
      {items.map(({ text, icon }, idx) => (
        <div key={`${text}-${idx}`} className="flex items-center gap-4 text-black">
          <div className="w-6 h-6 flex items-center justify-center shrink-0 text-black">
            {icon ?? <DefaultBulletIcon />}
          </div>
          <span className="text-[14px] leading-snug font-normal text-black/85">
            {text}
          </span>
        </div>
      ))}
      <p className="mt-4 pt-2 text-[14px] sm:text-[14px] leading-relaxed text-black font-normal">
        The care icons have been updated in line with the latest regulations
      </p>
    </div>
  )
}
