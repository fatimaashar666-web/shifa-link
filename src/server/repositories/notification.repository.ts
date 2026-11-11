/**
 * Notification repository — manages in-app notifications.
 */
import 'server-only'

import { db } from '@/server/db'
import { NotificationType } from '@prisma/client'

export interface CreateNotificationInput {
  userId: string
  title: string
  message: string
  type?: NotificationType
  entityType?: string
  entityId?: string
}

export async function createNotification(data: CreateNotificationInput) {
  return db.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type ?? 'SYSTEM',
      entityType: data.entityType,
      entityId: data.entityId,
    },
  })
}

export async function getUserNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  return db.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  })
}
