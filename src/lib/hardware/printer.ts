/**
 * Universal Thermal Printer Engine (Web Bluetooth, WebUSB & ESC/POS Command Encoder)
 * Supports 58mm & 80mm roll printers (Panda, Eppos, Xprinter, Epson, Iware, Kassen, etc.)
 */

export interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  invoiceNo: string;
  date: string;
  cashierName: string;
  customerName?: string;
  items: Array<{
    name: string;
    unitName: string;
    qty: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  remainingDebt?: number;
  paymentMethod: string;
  footerMessage?: string;
}

/**
 * Encode ReceiptData into raw ESC/POS binary buffer
 */
export function encodeEscPos(data: ReceiptData, is80mm: boolean = false): Uint8Array {
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  const write = (str: string) => {
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) buffer.push(bytes[i]);
  };

  const lineChars = is80mm ? 48 : 32;
  const divider = '-'.repeat(lineChars) + '\n';

  // 1. Initialize Printer (ESC @)
  buffer.push(0x1b, 0x40);

  // 2. Open Cash Drawer (ESC p m t1 t2)
  buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);

  // 3. Header: Center Align (ESC a 1) & Double Height/Width for Title
  buffer.push(0x1b, 0x61, 0x01);
  buffer.push(0x1b, 0x21, 0x20); // Double width
  write(data.storeName.toUpperCase() + '\n');
  buffer.push(0x1b, 0x21, 0x00); // Normal text

  if (data.storeAddress) write(data.storeAddress + '\n');
  if (data.storePhone) write('Telp: ' + data.storePhone + '\n');
  write(divider);

  // 4. Metadata: Left Align (ESC a 0)
  buffer.push(0x1b, 0x61, 0x00);
  write(`No   : ${data.invoiceNo}\n`);
  write(`Tgl  : ${data.date}\n`);
  write(`Kasir: ${data.cashierName}\n`);
  if (data.customerName) write(`Plg  : ${data.customerName}\n`);
  write(divider);

  // 5. Items Table
  for (const item of data.items) {
    const itemTitle = `${item.name} (${item.qty} ${item.unitName})`;
    write(itemTitle + '\n');

    const priceText = `${item.qty} x ${item.price.toLocaleString('id-ID')}`;
    const subtotalText = item.subtotal.toLocaleString('id-ID');
    const spaceCount = Math.max(1, lineChars - priceText.length - subtotalText.length);
    write(priceText + ' '.repeat(spaceCount) + subtotalText + '\n');
  }
  write(divider);

  // 6. Totals
  const formatLine = (label: string, value: string) => {
    const spaces = Math.max(1, lineChars - label.length - value.length);
    return label + ' '.repeat(spaces) + value + '\n';
  };

  write(formatLine('Total', 'Rp ' + data.total.toLocaleString('id-ID')));
  write(formatLine('Bayar (' + data.paymentMethod + ')', 'Rp ' + data.paidAmount.toLocaleString('id-ID')));
  write(formatLine('Kembalian', 'Rp ' + data.changeAmount.toLocaleString('id-ID')));

  if (data.remainingDebt && data.remainingDebt > 0) {
    write(formatLine('Sisa Piutang (Bon)', 'Rp ' + data.remainingDebt.toLocaleString('id-ID')));
  }

  write(divider);

  // 7. Footer: Center Align
  buffer.push(0x1b, 0x61, 0x01);
  write((data.footerMessage || 'Terima Kasih Telah Berbelanja') + '\n');
  write('Powered by Miegraine POS\n');

  // 8. Feed & Auto-Cut (GS V A 0)
  buffer.push(0x0a, 0x0a, 0x0a, 0x0a);
  buffer.push(0x1d, 0x56, 0x41, 0x00);

  return new Uint8Array(buffer);
}

/**
 * Print to Bluetooth Thermal Printer via Web Bluetooth API
 */
export async function printViaBluetooth(data: ReceiptData): Promise<{ success: boolean; message?: string }> {
  if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
    return { success: false, message: 'Web Bluetooth tidak didukung pada browser ini. Gunakan Chrome di Android/PC.' };
  }

  try {
    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, { services: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] }],
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2', '49535343-fe7d-4ae5-8fa9-9fafd205e455'],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    const rawData = encodeEscPos(data);
    await characteristic.writeValue(rawData);

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Koneksi Bluetooth dibatalkan.' };
  }
}
