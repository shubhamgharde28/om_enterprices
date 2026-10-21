import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react'
import { FaBell, FaTimes } from 'react-icons/fa'
import { Link as RouterLink } from 'react-router-dom'
import '../../styles/admin-notifications.css'

function NotificationPopover({
  title,
  emptyMessage,
  notifications,
  onDismiss,
  onOpen,
  actionLabel = 'View details',
  variant = 'default',
}) {
  const isAdmin = variant === 'admin'

  return (
    <Popover placement="bottom-end" onOpen={onOpen} gutter={12}>
      <PopoverTrigger>
        <Button
          aria-label={`Notifications${notifications.length ? `, ${notifications.length} unread` : ''}`}
          variant="ghost"
          position="relative"
          minW={10}
          px={2}
        >
          <FaBell />
          {notifications.length > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="0"
              right="0"
              transform="translate(25%, -25%)"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={isAdmin ? 'admin-notification-popover' : undefined}
        width={isAdmin ? '366px' : '360px'}
        maxW="calc(100vw - 24px)"
      >
        <PopoverArrow />
        <PopoverHeader className={isAdmin ? 'admin-notification-header' : undefined} fontWeight="bold">
          {title}
        </PopoverHeader>
        <PopoverBody
          className={isAdmin ? 'admin-notification-body' : undefined}
          maxH={isAdmin ? 'min(420px, calc(100dvh - 104px))' : '420px'}
          overflowY="auto"
        >
          {notifications.length ? (
            notifications.map((notification) => (
              <Box
                key={notification.id}
                className={isAdmin ? 'admin-notification-card' : undefined}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                mb={3}
              >
                <Flex justify="space-between" align="flex-start" gap={2}>
                  <Box>
                    <Text className={isAdmin ? 'admin-notification-title' : undefined} fontWeight="semibold">
                      {notification.title}
                    </Text>
                    <Text className={isAdmin ? 'admin-notification-description' : undefined} fontSize="sm" color="gray.600" mt={1}>
                      {notification.description}
                    </Text>
                  </Box>
                  <IconButton
                    className={isAdmin ? 'admin-notification-dismiss' : undefined}
                    aria-label="Dismiss notification"
                    icon={<FaTimes />}
                    variant="ghost"
                    size="xs"
                    onClick={() => onDismiss(notification.id)}
                  />
                </Flex>
                <Button
                  as={RouterLink}
                  className={isAdmin ? 'admin-notification-link' : undefined}
                  to={notification.to}
                  size="sm"
                  variant="link"
                  colorScheme="primary"
                  mt={2}
                  onClick={() => onDismiss(notification.id)}
                >
                  {actionLabel}
                </Button>
              </Box>
            ))
          ) : (
            <Text color="gray.500">{emptyMessage}</Text>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationPopover
