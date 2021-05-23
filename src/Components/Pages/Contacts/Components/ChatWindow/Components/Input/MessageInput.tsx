import { randomBytes } from "crypto"
import React, { useState, useEffect, useRef } from "react"
import "./MessageInput.scss"

type Props = {}

const MessageInput: React.FC<Props> = ({}) => {
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLDivElement>(null!)

  const anchorOffset = useRef<number>(null!)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  const onClick = (e: any) => {
    // const inputRef = document.querySelector(".chat-window__input-message") as Node
    // console.log(inputRef.childNodes)

    const sel = window.getSelection()
    anchorOffset.current = sel?.anchorOffset!

    // console.log(e.target.childNodes)

    // console.log({ anchorOffset: sel?.anchorOffset })
    // console.log({ focusOffset: sel?.focusOffset })
    // console.log({ collapsed: sel?.isCollapsed })
    // console.log({ rangeCount: sel?.rangeCount })
    // console.log({ anchorNode: sel?.anchorNode?.parentNode?.childNodes[0] })

    // if (sel?.rangeCount! > 0) {
    //   sel?.removeAllRanges()
    // }

    // let range: any = document.createRange()
    // range.setStart(e.target.childNodes[0], 2)
    // range.setEnd(e.target.childNodes[0], 4)

    // sel?.addRange(range)
  }

  const handleOnChange = (e: any) => {
    const textContent = e.currentTarget.textContent
    if (textContent === "") {
      e.currentTarget.innerHTML = ""
    }

    console.log(e.currentTarget.innerHTML)
    setMessage(e.currentTarget.innerHTML)
  }

  const map: any = {}
  const handleKeyDown = (e: any) => {
    console.log(e.key)
    const sel = window.getSelection()
    anchorOffset.current = sel?.anchorOffset!

    map[e.key] = e.type === "keydown"
    if (e.key === "Enter") {
      console.log("enter pressed")
      e.preventDefault()
    }

    if (map.Enter && map.Shift) {
      //   const div = document.createElement("div")
      //   const br = document.createElement("br")
      //   div.appendChild(br)
      const innerHtml = e.currentTarget.innerHTML

      console.log(innerHtml.includes("<br>"))
      if (!innerHtml.includes("<br>")) {
        e.currentTarget.innerHTML = `${innerHtml}<br><br>`
      } else {
        e.currentTarget.innerHTML = `${innerHtml}<br>`
      }

      // const range = document.createRange()
      // console.log(anchorOffset.current)
      // range.setStart(e.currentTarget.childNodes[0], anchorOffset.current - 1)
      // range.collapse(true)

      // sel?.removeAllRanges()
      // sel?.addRange(range)

      setMessage((prevState) => `${prevState}\n`)

      //   var el = document.getElementById("test") as HTMLElement
      //   var range = document.createRange()
      //   var sel = window.getSelection()

      //   console.log(el.childNodes)

      //   range.setStart(el.childNodes[el.childNodes.length - 1], 1)
      //   range.collapse(true)

      //   sel?.removeAllRanges()
      //   sel?.addRange(range)

      console.log("enter + shift")
    }
  }

  const handleKeyUp = (e: any) => {
    map[e.key] = e.type === "keydown"
    if (e.key === "Enter") {
      // e.preventDefault()
    }
  }

  return (
    <div className="chat-window__input-wrapper">
      <div className="chat-window__input-message-container">
        <div
          ref={inputRef}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onInput={handleOnChange}
          className="chat-window__input-message"
          contentEditable="true"
          dir="auto"
          data-placeholder="Message"
          suppressContentEditableWarning={true}
        ></div>
      </div>
    </div>
  )
}

export default MessageInput
