// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { Link } from 'react-router-dom';

export default function StatsScreen() {
  return (
    <div className="text-white text-3xl p-4 space-y-4">
      📊 Stats Screen
      XP tracking etc. goes here

      <div className="mt-4">
        <Link to="/" className="text-cyan-400 underline">Back to Main Menu</Link>
      </div>
    </div>
  );
}
