/* eslint-disable no-use-before-define */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import "./Slider.scss"

export default function Slider({ listOfContent }) {
  const slider = useRef()
  const arrowLeft = useRef()
  const arrowRight = useRef()

  const itemsInRow = 5
  const itemsInSlider = listOfContent.length
  const nonVisibleItems = itemsInSlider - itemsInRow
  const widthOfTheContainer = 1000
  const itemWidth = widthOfTheContainer / itemsInRow
  const dragСoefficient = 1.25
  const thresholdToSlide = itemWidth / 2
  const widthOfSlider = nonVisibleItems * itemWidth * dragСoefficient
  const transition = 0.5

  let currentItem = 0
  let startDragPoint = 0
  let endDragPoint = 0

  let dragging = false

  useEffect(() => {
    return removeDragListeners()
  })

  const pagination = direction => {
    if (currentItem === 0 && direction === "left") return
    if (nonVisibleItems === currentItem && direction === "right") return

    currentItem = direction === "right" ? currentItem + 1 : currentItem - 1
    endDragPoint = currentItem * itemWidth * dragСoefficient

    slider.current.style.transform = `translate3d(-${currentItem *
      itemWidth}px, 0, 0)`
    slider.current.style.transition = `${transition}s`

    toggleArrows()
  }

  const onMouseDown = e => {
    e.preventDefault()
    startDragPoint = e.pageX

    slider.current.style.transition = "0s"

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const onMouseMove = e => {
    dragging = true
    e.preventDefault()
    const slideDistance = (startDragPoint - e.pageX) * -1
    const maxDragDistance =
      endDragPoint >= widthOfSlider ? widthOfSlider : endDragPoint

    const translateX =
      maxDragDistance - slideDistance >= widthOfSlider
        ? widthOfSlider
        : maxDragDistance - slideDistance

    currentItem = Math.ceil(
      (translateX - thresholdToSlide * dragСoefficient) /
        dragСoefficient /
        itemWidth
    )

    slider.current.style.transform = `translate3d(-${translateX /
      dragСoefficient}px, 0, 0)`

    toggleArrows()
  }

  const onMouseUp = e => {
    e.preventDefault()
    const slideDistance = (startDragPoint - e.pageX) * -1
    const diffFromEndPoint = endDragPoint - slideDistance

    endDragPoint =
      diffFromEndPoint <= 0
        ? 0
        : diffFromEndPoint >= widthOfSlider
        ? widthOfSlider
        : currentItem * itemWidth * dragСoefficient

    slider.current.style.transform = `translate3d(-${currentItem *
      itemWidth}px, 0, 0)`
    slider.current.style.transition = `${transition}s`

    setTimeout(() => {
      dragging = false
    }, 400)

    toggleArrows()
    removeDragListeners()
  }

  const removeDragListeners = () => {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }

  const toggleArrows = () => {
    arrowLeft.current.style.display = currentItem <= 0 ? "none" : "inherit"
    arrowRight.current.style.display =
      currentItem === nonVisibleItems ? "none" : "inherit"
  }

  return (
    <div className="slider-container">
      <div
        onMouseDown={e => onMouseDown(e)}
        onMouseUp={e => onMouseUp(e)}
        className="slider"
        ref={slider}
        style={{
          gridTemplateColumns: `repeat(${itemsInSlider}, calc(100% / ${itemsInRow}))`
        }}
      >
        {listOfContent.map(({ poster_path, original_title, id }) => {
          const mediaType = original_title ? "movie" : "show"
          return (
            <div
              key={id}
              className="slider__item-wrapper"
              style={{
                height: `${itemWidth * 1.5}px`
              }}
            >
              <Link
                onClick={e => {
                  if (dragging) {
                    e.preventDefault()
                  }
                }}
                to={{
                  pathname: `/${mediaType}/${id}`
                }}
              >
                <div
                  className="slider__item"
                  style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster_path})`
                  }}
                />
              </Link>
            </div>
          )
        })}
      </div>
      {itemsInSlider > itemsInRow && (
        <>
          <div
            ref={arrowLeft}
            onClick={() => pagination("left")}
            className="arrow arrow--left"
          />
          <div
            ref={arrowRight}
            onClick={() => pagination("right")}
            className="arrow arrow--right"
          />
        </>
      )}
    </div>
  )
}
