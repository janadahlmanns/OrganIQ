// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { Link } from 'react-router-dom';

type CancelButtonProps = {
  to?: string;          // default target route ("/")
  className?: string;   // extra styling
  onClick?: () => void; // 🆕 optional cancel handler
};

export default function CancelButton({ to = "/", className = "", onClick }: CancelButtonProps) {
  return (
    <Link
      to={to}
      className={`btn-utility w-10 h-10 p-1 hover:drop-shadow-inner-glowWhite transition ${className}`}
      onClick={onClick}
    >
      <img src="/images/icons/cancel_icon.png" alt="Cancel" className="w-full h-full object-contain" />
    </Link>
  );
}
