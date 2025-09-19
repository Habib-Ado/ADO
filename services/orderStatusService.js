const { sendEmail } = require('../config/email');

class OrderStatusService {
    constructor(db) {
        this.db = db;
    }

    // Aggiorna lo stato dell'ordine e registra la cronologia
    async updateOrderStatus(orderId, newStatus, newPaymentStatus = null, notes = '', userId = null) {
        const connection = await this.db.getConnection();
        await connection.beginTransaction();

        try {
            // Ottieni lo stato attuale
            const [currentOrder] = await connection.execute(
                'SELECT status, payment_status FROM orders WHERE id = ?',
                [orderId]
            );

            if (currentOrder.length === 0) {
                throw new Error('Ordine non trovato');
            }

            const currentStatus = currentOrder[0].status;
            const currentPaymentStatus = currentOrder[0].payment_status;

            // Aggiorna l'ordine
            const updateFields = ['status = ?'];
            const updateValues = [newStatus];

            if (newPaymentStatus) {
                updateFields.push('payment_status = ?');
                updateValues.push(newPaymentStatus);
            }

            // Aggiungi timestamp appropriati
            const timestampFields = this.getTimestampFields(newStatus, newPaymentStatus);
            timestampFields.forEach(field => {
                updateFields.push(`${field} = CURRENT_TIMESTAMP`);
            });

            updateValues.push(orderId);

            await connection.execute(
                `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );

            // Registra nella cronologia
            await connection.execute(
                `INSERT INTO order_status_history (order_id, status, payment_status, notes, created_by) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, newStatus, newPaymentStatus, notes, userId]
            );

            // Invia notifiche appropriate
            await this.sendStatusNotifications(orderId, newStatus, newPaymentStatus, notes);

            await connection.commit();

            return {
                success: true,
                message: `Stato ordine aggiornato da ${currentStatus} a ${newStatus}`,
                previousStatus: currentStatus,
                newStatus: newStatus
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Determina i campi timestamp da aggiornare
    getTimestampFields(status, paymentStatus) {
        const fields = [];

        // Timestamp per stati di pagamento
        if (paymentStatus === 'completed') {
            fields.push('payment_processed_at');
        }

        // Timestamp per stati di ordine
        switch (status) {
            case 'processing':
                fields.push('order_processed_at');
                break;
            case 'shipped':
                fields.push('shipped_at');
                break;
            case 'delivered':
                fields.push('delivered_at');
                break;
        }

        return fields;
    }

    // Invia notifiche appropriate per cambio stato
    async sendStatusNotifications(orderId, status, paymentStatus, notes) {
        try {
            // Ottieni informazioni dell'ordine e utente
            const [orderData] = await this.db.execute(`
                SELECT o.*, u.email, u.first_name, u.last_name
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            `, [orderId]);

            if (orderData.length === 0) return;

            const order = orderData[0];
            const notifications = this.getNotificationsForStatus(status, paymentStatus, order, notes);

            // Invia notifiche
            for (const notification of notifications) {
                await this.sendNotification(orderId, order.user_id, notification);
            }

        } catch (error) {
            console.error('Errore nell\'invio notifiche:', error);
        }
    }

    // Determina le notifiche da inviare per ogni stato
    getNotificationsForStatus(status, paymentStatus, order, notes) {
        const notifications = [];

        switch (status) {
            case 'payment_pending':
                if (paymentStatus === 'processing') {
                    notifications.push({
                        type: 'email',
                        subject: 'Pagamento in elaborazione - Ordine #' + order.id,
                        message: `Gentile ${order.first_name}, il pagamento per il tuo ordine #${order.id} è in elaborazione. Riceverai una conferma appena completato.`
                    });
                }
                break;

            case 'payment_completed':
                notifications.push({
                    type: 'email',
                    subject: 'Pagamento confermato - Ordine #' + order.id,
                    message: `Gentile ${order.first_name}, il pagamento per il tuo ordine #${order.id} è stato confermato. Il tuo ordine è ora in elaborazione.`
                });
                break;

            case 'processing':
                notifications.push({
                    type: 'email',
                    subject: 'Ordine in elaborazione - Ordine #' + order.id,
                    message: `Gentile ${order.first_name}, il tuo ordine #${order.id} è ora in elaborazione. Ti avviseremo quando verrà spedito.`
                });
                break;

            case 'shipped':
                notifications.push({
                    type: 'email',
                    subject: 'Ordine spedito - Ordine #' + order.id,
                    message: `Gentile ${order.first_name}, il tuo ordine #${order.id} è stato spedito! Numero di tracking: ${order.tracking_number || 'Disponibile a breve'}.`
                });
                break;

            case 'delivered':
                notifications.push({
                    type: 'email',
                    subject: 'Ordine consegnato - Ordine #' + order.id,
                    message: `Gentile ${order.first_name}, il tuo ordine #${order.id} è stato consegnato! Grazie per aver scelto Artisanat en Ligne.`
                });
                break;

            case 'cancelled':
                notifications.push({
                    type: 'email',
                    subject: 'Ordine cancellato - Ordine #' + order.id,
                    message: `Gentile ${order.first_name}, il tuo ordine #${order.id} è stato cancellato. ${notes ? 'Motivo: ' + notes : ''}`
                });
                break;
        }

        // Notifiche per stati di pagamento
        switch (paymentStatus) {
            case 'failed':
                notifications.push({
                    type: 'email',
                    subject: 'Pagamento fallito - Ordine #' + order.id,
                    message: `Gentile ${order.first_name}, il pagamento per il tuo ordine #${order.id} è fallito. Per favore, riprova o contatta il supporto.`
                });
                break;

            case 'refunded':
                notifications.push({
                    type: 'email',
                    subject: 'Rimborso processato - Ordine #' + order.id,
                    message: `Gentile ${order.first_name}, il rimborso per il tuo ordine #${order.id} è stato processato. Il credito apparirà entro 3-5 giorni lavorativi.`
                });
                break;
        }

        return notifications;
    }

    // Invia una singola notifica
    async sendNotification(orderId, userId, notification) {
        try {
            // Salva la notifica nel database
            await this.db.execute(
                `INSERT INTO order_notifications (order_id, user_id, type, subject, message) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, userId, notification.type, notification.subject, notification.message]
            );

            // Invia la notifica
            if (notification.type === 'email') {
                await sendEmail(notification.subject, notification.message);
            }
            // Qui potresti aggiungere SMS e push notifications

        } catch (error) {
            console.error('Errore nell\'invio notifica:', error);
        }
    }

    // Gestisce il pagamento in contanti presso filiale
    async processCashPayment(orderId, branchId, processedBy) {
        const connection = await this.db.getConnection();
        await connection.beginTransaction();

        try {
            // Verifica che l'ordine sia in attesa di pagamento
            const [order] = await connection.execute(
                'SELECT * FROM orders WHERE id = ? AND payment_status = "pending"',
                [orderId]
            );

            if (order.length === 0) {
                throw new Error('Ordine non trovato o già pagato');
            }

            // Aggiorna lo stato del pagamento
            await this.updateOrderStatus(
                orderId, 
                'payment_completed', 
                'completed', 
                `Pagamento in contanti confermato presso filiale ID: ${branchId}`,
                processedBy
            );

            // Aggiorna l'ordine con la filiale
            await connection.execute(
                'UPDATE orders SET branch_id = ? WHERE id = ?',
                [branchId, orderId]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Pagamento in contanti confermato',
                orderId: orderId
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Ottieni cronologia stati per un ordine
    async getOrderStatusHistory(orderId) {
        const [history] = await this.db.execute(`
            SELECT 
                osh.*,
                u.first_name,
                u.last_name
            FROM order_status_history osh
            LEFT JOIN users u ON osh.created_by = u.id
            WHERE osh.order_id = ?
            ORDER BY osh.created_at DESC
        `, [orderId]);

        return history;
    }

    // Ottieni notifiche per un utente
    async getUserNotifications(userId, limit = 10) {
        const [notifications] = await this.db.execute(`
            SELECT 
                on.*,
                o.id as order_id
            FROM order_notifications on
            JOIN orders o ON on.order_id = o.id
            WHERE on.user_id = ?
            ORDER BY on.sent_at DESC
            LIMIT ?
        `, [userId, limit]);

        return notifications;
    }

    // Marca notifica come letta
    async markNotificationAsRead(notificationId, userId) {
        await this.db.execute(
            'UPDATE order_notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );
    }

    // Aggiorna tracking number
    async updateTrackingNumber(orderId, trackingNumber, estimatedDelivery) {
        await this.db.execute(
            'UPDATE orders SET tracking_number = ?, estimated_delivery = ? WHERE id = ?',
            [trackingNumber, estimatedDelivery, orderId]
        );

        // Aggiorna stato a "shipped" se non lo è già
        const [order] = await this.db.execute(
            'SELECT status FROM orders WHERE id = ?',
            [orderId]
        );

        if (order.length > 0 && order[0].status !== 'shipped') {
            await this.updateOrderStatus(
                orderId,
                'shipped',
                null,
                `Tracking number: ${trackingNumber}`
            );
        }
    }

    // Conferma consegna
    async confirmDelivery(orderId) {
        await this.db.execute(
            'UPDATE orders SET actual_delivery_date = CURRENT_DATE WHERE id = ?',
            [orderId]
        );

        await this.updateOrderStatus(
            orderId,
            'delivered',
            null,
            'Consegnato al cliente'
        );
    }
}

module.exports = OrderStatusService; 