import React from 'react';

export default function SuperadminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-page-smooth min-h-full">{children}</div>;
}
