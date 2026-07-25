import React from 'react';

/**
 * GridBackground component renders a background design layout consisting of
 * vertical/horizontal gridlines and a subtle orange accent radial glow.
 */
export default function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      <div className="grid-bg" />
      <div className="grid-bg-glow" />
    </div>
  );
}
