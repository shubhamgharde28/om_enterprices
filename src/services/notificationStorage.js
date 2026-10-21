const storageKey = (scope) => `om-enterprises-dismissed-notifications:${scope}`

export const getDismissedNotificationIds = (scope) => {
  const storedValue = localStorage.getItem(storageKey(scope))
  if (!storedValue) return []

  const notificationIds = JSON.parse(storedValue)
  if (!Array.isArray(notificationIds) || notificationIds.some((id) => typeof id !== 'string')) {
    throw new Error('Saved notification state is invalid.')
  }

  return notificationIds
}

export const dismissNotification = (scope, notificationId) => {
  const notificationIds = getDismissedNotificationIds(scope)
  if (notificationIds.includes(notificationId)) return

  localStorage.setItem(storageKey(scope), JSON.stringify([...notificationIds, notificationId]))
}
