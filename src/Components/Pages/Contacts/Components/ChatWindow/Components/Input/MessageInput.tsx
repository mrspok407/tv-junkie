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

  const onClick = () => {
    var sel = window.getSelection()
    anchorOffset.current = sel?.anchorOffset!
    console.log(sel?.anchorOffset)
  }

  const handleOnChange = (e: any) => {
    console.log(e.currentTarget.innerHTML)
    setMessage(e.currentTarget.innerHTML)
  }

  const map: any = {}
  const handleKeyDown = (e: any) => {
    console.log(e.key)
    map[e.key] = e.type === "keydown"
    if (e.key === "Enter") {
      console.log("enter pressed")
      e.preventDefault()
    }

    if (map.Enter && map.Shift) {
      //   const div = document.createElement("div")
      //   const br = document.createElement("br")
      //   div.appendChild(br)
      console.log(message)
      const innerHtml = e.currentTarget.innerHTML
      console.log(innerHtml)
      e.currentTarget.innerHTML = `${innerHtml[anchorOffset.current - 1]}\n`

      var range = document.createRange()
      var sel = window.getSelection()
      console.log(anchorOffset.current)
      range.setStart(e.currentTarget.childNodes[0], anchorOffset.current - 1)
      range.collapse(true)

      sel?.removeAllRanges()
      sel?.addRange(range)

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
          id="test"
          ref={inputRef}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onInput={handleOnChange}
          className="chat-window__input-message"
          contentEditable="true"
          dir="auto"
          data-placeholder="Message"
        ></div>
      </div>
    </div>
  )
}

export default MessageInput
