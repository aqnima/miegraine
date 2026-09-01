'use client';

import React from 'react';

export default function SuperadminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-page-enter min-h-full">{children}</div>;
}
