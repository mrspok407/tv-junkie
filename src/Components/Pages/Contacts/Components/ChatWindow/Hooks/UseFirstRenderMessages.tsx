import { MessageInterface } from "Components/Pages/Contacts/Types"
import { useEffect, useContext } from "react"
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "../../Context/Constants"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  messages: MessageInterface[]
  renderedMessages: MessageInterface[]
  unreadMessages: string[]
  initialLoading: boolean
  chatKey: string
}

const useFirstRenderMessages = ({ messages, renderedMessages, initialLoading, unreadMessages, chatKey }: Props) => {
  const context = useContext(ContactsContext)

  useEffect(() => {
    if (!messages?.length) return
    if (messages[messages.length - 1].key !== renderedMessages[renderedMessages.length - 1].key) {
      return
    }
    console.log({ initialLoading })
    if (initialLoading) return

    let startIndexRender: number = 0
    let endIndexRender: number = 0

    if (messages.length <= MESSAGES_TO_RENDER) {
      startIndexRender = 0
      endIndexRender = messages.length
    } else {
      if (unreadMessages.length! <= UNREAD_MESSAGES_TO_RENDER) {
        startIndexRender = Math.max(messages.length - MESSAGES_TO_RENDER, 0)
        endIndexRender = messages.length
      } else {
        endIndexRender = messages.length - (unreadMessages.length! - UNREAD_MESSAGES_TO_RENDER)
        startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
      }
    }

    context?.dispatch({
      type: "renderMessagesOnLoad",
      payload: {
        startIndex: startIndexRender,
        endIndex: endIndexRender,
        chatKey
      }
    })
  }, [messages, chatKey])
}

export default useFirstRenderMessages
