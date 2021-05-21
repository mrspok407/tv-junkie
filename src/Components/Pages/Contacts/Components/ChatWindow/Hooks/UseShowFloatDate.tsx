import { MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { throttle } from "throttle-debounce"

type Props = {
  chatContainerRef: HTMLDivElement
  activeChat: { chatKey: string }
  renderedMessages: MessageInterface[]
}

const TIME_OUT = 1350

const useShowFloatDate = ({ activeChat, chatContainerRef, renderedMessages }: Props) => {
  const [floatDate, setFloatDate] = useState<number>()
  const [isScrollingTop, setIsScrollingTop] = useState(false)
  const floadDateTimeout = useRef<number | null>(null)

  let prevScrollTop: any
  const getDates = () => {
    const dateNodes = document.querySelectorAll(".chat-window__date")
    const top = chatContainerRef.getBoundingClientRect().top

    if (dateNodes) {
      const dates = [...dateNodes].reduce((acc: { timeStamp: number; top: number }[], date: any) => {
        if (date.getBoundingClientRect().top - top < 0) {
          acc.push({ timeStamp: Number(date.dataset.timestamp), top: date.getBoundingClientRect().top - top })
        }
        return acc
      }, [])
      const timeStamp = !dates.length ? renderedMessages[0]?.timeStamp : dates[dates.length - 1].timeStamp
      setFloatDate(timeStamp)
    }
  }

  const handleScroll = useCallback(
    throttle(150, () => {
      if (!chatContainerRef) return
      if (!renderedMessages?.length) return
      const scrollTop = chatContainerRef.scrollTop
      getDates()

      if (scrollTop < prevScrollTop) {
        setIsScrollingTop(true)
        window.clearTimeout(floadDateTimeout.current || 0)
        floadDateTimeout.current = window.setTimeout(() => {
          setIsScrollingTop(false)
        }, TIME_OUT)
      }
      prevScrollTop = scrollTop
    }),
    [renderedMessages, chatContainerRef]
  )

  useEffect(() => {
    if (!chatContainerRef) return
    chatContainerRef.addEventListener("scroll", handleScroll)
    return () => {
      chatContainerRef.removeEventListener("scroll", handleScroll)
    }
  }, [activeChat, handleScroll])

  useEffect(() => {
    return () => {
      setIsScrollingTop(false)
      window.clearTimeout(floadDateTimeout.current || 0)
    }
  }, [activeChat])

  return { floatDate, isScrollingTop }
}

export default useShowFloatDate
