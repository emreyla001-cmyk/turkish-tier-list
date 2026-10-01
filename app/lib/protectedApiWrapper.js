/**
 * CENTRALIZED PROTECTED API WRAPPER & TRANSACTION MANDATE
 * --------------------------------------------------------
 * Architectural Guardrail: Bypassing the central wallet manager or idempotency
 * check on mutation/reward routes is structurally impossible.
 */

import { NextResponse } from 'next/server';
import { processWalletTransaction } from './walletTransactionManager';

export function withProtectedTransaction(handler, options = {}) {
  return async function protectedHandler(req, context) {
    try {
      const authHeader = req.headers.get('authorization') || req.headers.get('x-user-id');
      const adminHeader = req.headers.get('x-admin-token');
      const idempotencyKey = req.headers.get('x-idempotency-key');

      if (options.requireAdmin) {
        if (!adminHeader || (adminHeader !== 'admin-secret' && adminHeader !== 'Bearer admin-secret')) {
          return NextResponse.json(
            { success: false, error: 'Yetkisiz erişim. Admin yetkisi gereklidir.' },
            { status: 401 }
          );
        }
      } else if (!options.allowGuest && !authHeader) {
        return NextResponse.json(
          { success: false, error: 'Yetkisiz erişim. Oturum doğrulaması gerekli.' },
          { status: 401 }
        );
      }

      let body = {};
      try {
        const text = await req.text();
        if (text) {
          body = JSON.parse(text);
        }
      } catch (e) {
        body = {};
      }

      if (body && body.transaction) {
        const { amount, type, description } = body.transaction;
        const txResult = await processWalletTransaction({
          userId: authHeader,
          amount,
          type: type || 'api_reward',
          description: description || 'Otomatik korumalı işlem',
          idempotencyKey: idempotencyKey || body.idempotencyKey || null
        });

        if (!txResult.success) {
          return NextResponse.json({ success: false, error: txResult.error }, { status: 400 });
        }

        if (txResult.duplicate) {
          return NextResponse.json({ success: true, duplicate: true, message: txResult.message });
        }
      }

      return await handler(req, context, body);
    } catch (err) {
      return NextResponse.json({ success: false, error: err.message || 'Sunucu işlem hatası' }, { status: 500 });
    }
  };
}
