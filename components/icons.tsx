import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const defaultProps: IconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const SwordIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M14.5 3.5l-12 12 5 5 12-12-5-5z" />
    <path d="M6.5 11.5l-3 3" />
  </svg>
);

export const CoinIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" />
    <path d="m17.66 6.34 1.41-1.41" />
  </svg>
);

export const FileTextIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const QuestionMarkCircleIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const XIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const BookIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v2H6.5A2.5 2.5 0 0 1 4 4.5z" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const ManaIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

export const ReputationIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M18 8 L22 12 L18 16" />
    <path d="M6 8 L2 12 L6 16" />
    <path d="M12 2 V6" />
    <path d="M12 18 V22" />
    <path d="M4.93 4.93 L7.76 7.76" />
    <path d="M16.24 16.24 L19.07 19.07" />
    <path d="M4.93 19.07 L7.76 16.24" />
    <path d="M16.24 7.76 L19.07 4.93" />
  </svg>
);

export const ChevronsRightIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
);

export const DiceIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M16 8h.01" />
    <path d="M12 8h.01" />
    <path d="M8 8h.01" />
    <path d="M16 12h.01" />
    <path d="M12 12h.01" />
    <path d="M8 12h.01" />
    <path d="M16 16h.01" />
    <path d="M12 16h.01" />
    <path d="M8 16h.01" />
  </svg>
);

export const ChestIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M21 8v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
    <path d="M8 4h8" />
    <path d="M12 4v4" />
  </svg>
);

export const ScrollIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M8 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8" />
    <path d="M4 3h4" />
    <path d="M4 7h4" />
    <path d="M4 11h4" />
    <path d="M4 15h4" />
    <path d="M4 19h4" />
  </svg>
);

export const MapIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const StoreIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7l-2 5H4L2 7" />
  </svg>
);

export const HelmetIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M12 2a4 4 0 0 0-4 4v4h8V6a4 4 0 0 0-4-4z" />
    <path d="M17 10h-2.5a2.5 2.5 0 0 0-5 0H7a3 3 0 0 0-3 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a3 3 0 0 0-3-3z" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const ShirtIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  </svg>
);

export const MoreHorizontalIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

export const CastleIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20" /><path d="M9 14v-4" /><path d="M15 14v-4" /><path d="M2 14h20" /><path d="M3 14V5l7-3 7 3v9" /><path d="M9 5v-2h6v2" /></g></svg>
);

export const BuildingIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
);

export const TreeIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}><path d="M12 22v-8" /><path d="M12 14h.01" /><path d="M3 22h18" /><path d="m14 14-2-2-2 2" /><path d="M12 6V5" /><path d="M12 5a3 3 0 0 1 3-3h1" /><path d="m8 2 1.5 1.5" /><path d="M12 2a3 3 0 0 1-3 3H8" /><path d="m16 2-1.5 1.5" /></svg>
);

export const MountainIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg>
);

export const LandmarkIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="4 11 20 11 12 3" /></svg>
);

export const TentIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}><path d="M19 20 L19 10 L12 4 L5 10 L5 20" /><path d="M3 20h18" /><path d="M12 15l-3 5" /><path d="M12 15l3 5" /></svg>
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultProps} {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);