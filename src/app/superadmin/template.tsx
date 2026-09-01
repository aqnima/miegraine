import React from 'react';

export default function SuperadminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-full">{children}</div>;
}
