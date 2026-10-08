/**
 * High-fidelity Iconic Vector Avatars (Non-human, purely iconic)
 * Formatted as optimized SVG Data URIs for universal image rendering
 */

const createSvgDataUri = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

// 1. Student / Scholar Candidate Avatar (Iconic Graduation Cap & Beacon)
export const ICONIC_STUDENT_AVATAR = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gradStudent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#gradStudent)" stroke="#93C5FD" stroke-width="2.5" />
  <!-- Minimalist Iconic Cap -->
  <polygon points="50,26 80,39 50,52 20,39" fill="#FFFFFF" />
  <path d="M30,44.5 L30,62 C30,70 70,70 70,62 L70,44.5 L50,53 Z" fill="#DBEAFE" />
  <!-- Tassel -->
  <path d="M74,40 L81,56 C81,58 79,60 77,60" fill="none" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="77" cy="62" r="2.5" fill="#FDE047" />
  <!-- Sub-ring -->
  <circle cx="50" cy="82" r="3" fill="#60A5FA" />
</svg>
`);

// 2. Departmental / Faculty Administrator Avatar (Iconic Seal, Shield & Crown)
export const ICONIC_ADMIN_AVATAR = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B" />
      <stop offset="100%" stop-color="#27272A" />
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#CBA358" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#gradAdmin)" stroke="#CBA358" stroke-width="2.5" />
  <!-- Shield Contour -->
  <path d="M50,22 L74,32 C74,56 50,72 50,76 C50,72 26,56 26,32 Z" fill="none" stroke="url(#goldAccent)" stroke-width="3" stroke-linejoin="round" />
  <!-- Inner Key / Crest Invariant -->
  <path d="M50,33 L62,40 L50,47 L38,40 Z" fill="url(#goldAccent)" />
  <path d="M50,47 L50,65" stroke="url(#goldAccent)" stroke-width="3" stroke-linecap="round" />
  <line x1="43" y1="56" x2="57" y2="56" stroke="url(#goldAccent)" stroke-width="2.5" stroke-linecap="round" />
  <line x1="45" y1="62" x2="55" y2="62" stroke="url(#goldAccent)" stroke-width="2.5" stroke-linecap="round" />
</svg>
`);

// 3. Internal Supervisor Avatar (Iconic Mentor / Compass / Book)
export const ICONIC_INTERNAL_SUPERVISOR_AVATAR = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gradSupervisor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9A3412" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#gradSupervisor)" stroke="#FDBA74" stroke-width="2.5" />
  <!-- Iconic Open Academic Manuscript -->
  <path d="M50,38 C42,32 26,34 26,34 L26,66 C26,66 42,64 50,70 C58,64 74,66 74,66 L74,34 C74,34 58,32 50,38 Z" fill="#FFF7ED" stroke="#FFFFFF" stroke-width="2" />
  <line x1="50" y1="38" x2="50" y2="70" stroke="#EA580C" stroke-width="2.5" />
  <!-- Bookmark / Quill -->
  <path d="M34,42 L42,42 M34,49 L44,49 M34,56 L41,56" stroke="#C2410C" stroke-width="2" stroke-linecap="round" />
  <path d="M56,42 L66,42 M56,49 L66,49 M56,56 L63,56" stroke="#C2410C" stroke-width="2" stroke-linecap="round" />
</svg>
`);

// 4. External Supervisor / Examiner Avatar (Iconic Global Moderation Star & Seal)
export const ICONIC_EXTERNAL_SUPERVISOR_AVATAR = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gradExternal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312E81" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#gradExternal)" stroke="#A5B4FC" stroke-width="2.5" />
  <!-- Iconic Globe / Latitude Coordinates -->
  <circle cx="50" cy="50" r="25" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
  <ellipse cx="50" cy="50" rx="12" ry="25" fill="none" stroke="#C7D2FE" stroke-width="2" />
  <line x1="25" y1="50" x2="75" y2="50" stroke="#C7D2FE" stroke-width="2" />
  <!-- Verified Examiner Star -->
  <polygon points="50,20 53,27 60,27 54,32 56,39 50,35 44,39 46,32 40,27 47,27" fill="#FDE047" stroke="#CA8A04" stroke-width="0.75" />
</svg>
`);

// 5. Panel Member / Defense Hearing Examiner Avatar (Iconic Viva Voce Council)
export const ICONIC_PANEL_MEMBER_AVATAR = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gradPanel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#gradPanel)" stroke="#6EE7B7" stroke-width="2.5" />
  <!-- Iconic Scales / Verification Gavel -->
  <line x1="50" y1="28" x2="50" y2="68" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  <line x1="30" y1="36" x2="70" y2="36" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  <!-- Left Pan -->
  <path d="M30,36 L24,52 L36,52 Z" fill="#D1FAE5" stroke="#FFFFFF" stroke-width="1.5" />
  <!-- Right Pan -->
  <path d="M70,36 L64,52 L76,52 Z" fill="#D1FAE5" stroke="#FFFFFF" stroke-width="1.5" />
  <!-- Base Stand -->
  <path d="M38,72 L62,72" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
</svg>
`);

// Role Mapping
export const ROLE_ICONIC_AVATARS: Record<string, string> = {
  student: ICONIC_STUDENT_AVATAR,
  admin: ICONIC_ADMIN_AVATAR,
  internal_supervisor: ICONIC_INTERNAL_SUPERVISOR_AVATAR,
  external_supervisor: ICONIC_EXTERNAL_SUPERVISOR_AVATAR,
  panel_member: ICONIC_PANEL_MEMBER_AVATAR,
};

/**
 * Returns an iconic vector avatar based on role or seeds.
 * Replaces any legacy photographic / human unsplash images with iconic avatars.
 */
export const getIconicAvatar = (role?: string, _seed?: string): string => {
  if (!role) return ICONIC_STUDENT_AVATAR;
  const normalized = role.toLowerCase().replace(/[\s-]/g, '_');
  if (normalized.includes('admin')) return ICONIC_ADMIN_AVATAR;
  if (normalized.includes('ext')) return ICONIC_EXTERNAL_SUPERVISOR_AVATAR;
  if (normalized.includes('sup') || normalized.includes('int')) return ICONIC_INTERNAL_SUPERVISOR_AVATAR;
  if (normalized.includes('panel') || normalized.includes('exam')) return ICONIC_PANEL_MEMBER_AVATAR;
  return ICONIC_STUDENT_AVATAR;
};

/**
 * Normalizes an avatar URL: if it contains an unsplash photo (human face) or is empty,
 * it replaces it with the corresponding iconic vector avatar.
 */
export const normalizeIconicAvatar = (url?: string | null, role: string = 'student'): string => {
  if (!url || typeof url !== 'string' || url.includes('images.unsplash.com') || url.includes('unsplash') || !url.startsWith('data:image/svg+xml')) {
    return getIconicAvatar(role);
  }
  return url;
};
