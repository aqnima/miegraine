'use server';

import { db } from '@/lib/db';
import {
  stockTransfers,
  stockTransferItems,
  outlets,
  products,
  outletStock,
  users,
  auditLogs,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

export interface TransferItemPayload {
  productId: string;
  quantity: number;
}

/**
 * 1. Fetch All Stock Transfers for Current Tenant
 */
export async function getStockTransfersAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const allTransfers = await db
    .select({
      id: stockTransfers.id,
      transferNo: stockTransfers.transferNo,
      sourceOutletId: stockTransfers.sourceOutletId,
      targetOutletId: stockTransfers.targetOutletId,
      status: stockTransfers.status,
      notes: stockTransfers.notes,
      transferredAt: stockTransfers.transferredAt,
      receivedAt: stockTransfers.receivedAt,
      createdAt: stockTransfers.createdAt,
      creatorName: users.name,
    })
    .from(stockTransfers)
    .leftJoin(users, eq(stockTransfers.createdById, users.id))
    .where(eq(stockTransfers.tenantId, user.tenantId))
    .orderBy(desc(stockTransfers.createdAt));

  // Enrich with Outlet Names and Items
  const enriched = await Promise.all(
    allTransfers.map(async (t) => {
      const [sourceOutlet, targetOutlet, items] = await Promise.all([
        db
          .select({ name: outlets.name })
          .from(outlets)
          .where(eq(outlets.id, t.sourceOutletId))
          .limit(1),
        db
          .select({ name: outlets.name })
          .from(outlets)
          .where(eq(outlets.id, t.targetOutletId))
          .limit(1),
        db
          .select()
          .from(stockTransferItems)
          .where(eq(stockTransferItems.transferId, t.id)),
      ]);

      return {
        ...t,
        sourceOutletName: sourceOutlet[0]?.name || 'Outlet Asal',
        targetOutletName: targetOutlet[0]?.name || 'Outlet Tujuan',
        items,
        totalItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    })
  );

  return enriched;
}

/**
 * 2. Create New Stock Transfer
 */
export async function createStockTransferAction(payload: {
  sourceOutletId: string;
  targetOutletId: string;
  items: TransferItemPayload[];
  notes?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role === 'cashier') throw new Error('Hanya Owner dan Admin yang dapat mentransfer stok.');

  if (payload.sourceOutletId === payload.targetOutletId) {
    throw new Error('Cabang asal dan cabang tujuan tidak boleh sama.');
  }

  if (!payload.items || payload.items.length === 0) {
    throw new Error('Pilih minimal 1 produk untuk ditransfer.');
  }

  const transferId = nanoid();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const transferNo = `TRF-${dateStr}-${randomSuffix}`;

  // Check stock availability at source outlet
  const itemRecords: {
    id: string;
    transferId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitName: string;
  }[] = [];

  for (const item of payload.items) {
    if (item.quantity <= 0) continue;

    const prod = await db
      .select()
      .from(products)
      .where(and(eq(products.id, item.productId), eq(products.tenantId, user.tenantId)))
      .limit(1);

    if (prod.length === 0) throw new Error(`Produk tidak ditemukan.`);

    // Check source stock
    const sourceStock = await db
      .select()
      .from(outletStock)
      .where(
        and(
          eq(outletStock.outletId, payload.sourceOutletId),
          eq(outletStock.productId, item.productId)
        )
      )
      .limit(1);

    const currentSourceQty = sourceStock[0]?.currentStock || 0;
    if (currentSourceQty < item.quantity) {
      throw new Error(
        `Stok produk "${prod[0].name}" di cabang asal tidak mencukupi (Tersedia: ${currentSourceQty}, Diminta: ${item.quantity}).`
      );
    }

    // Deduct stock from source outlet
    await db
      .update(outletStock)
      .set({
        currentStock: currentSourceQty - item.quantity,
      })
      .where(
        and(
          eq(outletStock.outletId, payload.sourceOutletId),
          eq(outletStock.productId, item.productId)
        )
      );

    itemRecords.push({
      id: nanoid(),
      transferId,
      productId: item.productId,
      productName: prod[0].name,
      quantity: item.quantity,
      unitName: prod[0].baseUnit || 'pcs',
    });
  }

  // Insert Transfer Header
  await db.insert(stockTransfers).values({
    id: transferId,
    tenantId: user.tenantId,
    transferNo,
    sourceOutletId: payload.sourceOutletId,
    targetOutletId: payload.targetOutletId,
    status: 'IN_TRANSIT',
    notes: payload.notes || null,
    createdById: user.userId,
    transferredAt: new Date(),
    createdAt: new Date(),
  });

  // Insert Transfer Items
  if (itemRecords.length > 0) {
    await db.insert(stockTransferItems).values(itemRecords);
  }

  // Audit Log
  await db.insert(auditLogs).values({
    id: nanoid(),
    tenantId: user.tenantId,
    outletId: payload.sourceOutletId,
    userId: user.userId,
    userName: user.name,
    userRole: user.role,
    action: 'STOCK_TRANSFER_SENT',
    resourceType: 'STOCK_TRANSFER',
    resourceId: transferId,
    newData: JSON.stringify({ transferNo, itemsCount: itemRecords.length }),
    reason: `Pengiriman transfer stok ${transferNo} ke cabang tujuan`,
  });

  revalidatePath('/dashboard/transfers');
  revalidatePath('/dashboard/inventory');
  return { success: true, transferNo };
}

/**
 * 3. Confirm Stock Transfer Received at Destination
 */
export async function confirmStockTransferAction(transferId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const transfer = await db
    .select()
    .from(stockTransfers)
    .where(and(eq(stockTransfers.id, transferId), eq(stockTransfers.tenantId, user.tenantId)))
    .limit(1);

  if (transfer.length === 0) throw new Error('Data transfer tidak ditemukan.');
  if (transfer[0].status === 'COMPLETED') throw new Error('Transfer ini sudah selesai dikonfirmasi.');
  if (transfer[0].status === 'CANCELLED') throw new Error('Transfer ini telah dibatalkan.');

  const items = await db
    .select()
    .from(stockTransferItems)
    .where(eq(stockTransferItems.transferId, transferId));

  // Add stock to target outlet
  for (const item of items) {
    const targetStock = await db
      .select()
      .from(outletStock)
      .where(
        and(
          eq(outletStock.outletId, transfer[0].targetOutletId),
          eq(outletStock.productId, item.productId)
        )
      )
      .limit(1);

    if (targetStock.length > 0) {
      await db
        .update(outletStock)
        .set({
          currentStock: targetStock[0].currentStock + item.quantity,
        })
        .where(
          and(
            eq(outletStock.outletId, transfer[0].targetOutletId),
            eq(outletStock.productId, item.productId)
          )
        );
    } else {
      await db.insert(outletStock).values({
        id: nanoid(),
        tenantId: user.tenantId,
        outletId: transfer[0].targetOutletId,
        productId: item.productId,
        currentStock: item.quantity,
      });
    }
  }

  // Update Status to COMPLETED
  await db
    .update(stockTransfers)
    .set({
      status: 'COMPLETED',
      receivedById: user.userId,
      receivedAt: new Date(),
    })
    .where(eq(stockTransfers.id, transferId));

  // Audit Log
  await db.insert(auditLogs).values({
    id: nanoid(),
    tenantId: user.tenantId,
    outletId: transfer[0].targetOutletId,
    userId: user.userId,
    userName: user.name,
    userRole: user.role,
    action: 'STOCK_TRANSFER_RECEIVED',
    resourceType: 'STOCK_TRANSFER',
    resourceId: transferId,
    newData: JSON.stringify({ transferNo: transfer[0].transferNo, status: 'COMPLETED' }),
    reason: `Konfirmasi penerimaan barang transfer ${transfer[0].transferNo}`,
  });

  revalidatePath('/dashboard/transfers');
  revalidatePath('/dashboard/inventory');
  return { success: true };
}
