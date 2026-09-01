import React from 'react';
import { InvoicePrintClient } from './invoice-print-client';

export function generateStaticParams() {
  return [{ id: 'preview' }];
}

export default function InvoicePrintPage() {
  return <InvoicePrintClient />;
}
