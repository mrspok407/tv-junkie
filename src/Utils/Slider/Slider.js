/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useLayoutEffect } from "react"
import { Link } from "react-router-dom"
import debounce from "debounce"
import "./Slider.scss"

const POSTER_PATH = "https://image.tmdb.org/t/p/w500/"

export default function Slider({ listOfContent }) {
  const rootNode = document.documentElement

  const [slider, setSlider] = useState()
  const [sliderWidth, setSliderWidth] = useState()

  rootNode.style.setProperty("--sliderWidth", `${sliderWidth}px`)

  const mobileLayout = Number(getComputedStyle(rootNode).getPropertyValue("--mobileLayout"))

  const itemsInRow = Number(getComputedStyle(rootNode).getPropertyValue("--itemsInRow"))
  const itemWidth = sliderWidth / itemsInRow

  const itemsInSlider = listOfContent.length
  const nonVisibleItems = itemsInSlider - itemsInRow
  const dragСoefficient = 1.25
  const thresholdToSlide = itemWidth / 2
  const sliderRange = nonVisibleItems * itemWidth * dragСoefficient
  const sliderAvailable = itemsInSlider > itemsInRow

  const [currentItem, setCurrentItem] = useState(0)
  const [mouseUp, setMouseUp] = useState()

  const [dragging, setDragging] = useState(false)
  const [blockLinks, setBlockLinks] = useState(false)

  const [leftArrowVisible, setLeftArrowVisible] = useState(true)
  const [rightArrowVisible, setrightArrowVisible] = useState(true)

  let startDragPoint = 0

  const sliderRef = useCallback(node => {
    if (node !== null) {
      setSlider(node)
    }
  }, [])

  const handleResize = useCallback(() => {
    if (!slider) return

    if (window.innerWidth <= mobileLayout) {
      slider.classList.add("s--mobile")
      slider.style.cssText = ""
    }

    setSliderWidth(slider.getBoundingClientRect().width)
  }, [slider])

  const handleResizeDeb = debounce(() => handleResize(), 200)

  useLayoutEffect(() => {
    if (!slider) return

    handleResize()

    if (window.ResizeObserver) {
      let resizeObserver = new ResizeObserver(() => handleResizeDeb())
      resizeObserver.observe(slider)

      return () => {
        if (!resizeObserver) return

        resizeObserver.disconnect()
        resizeObserver = null
        removeDragListeners()
      }
    } else {
      window.addEventListener("resize", handleResizeDeb)

      return () => {
        window.removeEventListener("resize", handleResizeDeb)
      }
    }
  }, [slider])

  useEffect(() => {
    if (slider === undefined) return

    slider.style.transform = `translate3d(-${currentItem * itemWidth}px, 0, 0)`

    toggleArrows()
  }, [currentItem, mouseUp])

  useEffect(() => {
    if (slider === undefined) return

    slider.style.transform = `translate3d(-${currentItem * itemWidth}px, 0, 0)`
  }, [itemWidth])

  useEffect(() => {
    if (currentItem > nonVisibleItems) {
      setCurrentItem(nonVisibleItems)
    }
    toggleArrows()
  }, [itemsInRow])

  const pagination = direction => {
    if (currentItem === 0 && direction === "left") return
    if (nonVisibleItems === currentItem && direction === "right") return

    if (direction === "right") {
      if (currentItem > nonVisibleItems - itemsInRow) {
        setCurrentItem(nonVisibleItems)
      } else {
        setCurrentItem(currentItem + itemsInRow)
      }
    } else if (direction === "left") {
      if (currentItem <= itemsInRow) {
        setCurrentItem(0)
      } else {
        setCurrentItem(currentItem - itemsInRow)
      }
    }
  }

  const onMouseDown = e => {
    if (!sliderAvailable || window.innerWidth <= mobileLayout) return
    e.preventDefault()

    setDragging(true)

    startDragPoint = e.pageX

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const onMouseMove = e => {
    if (!sliderAvailable || window.innerWidth <= mobileLayout) return
    e.preventDefault()

    setBlockLinks(true)

    const diffFromStartPoint = (startDragPoint - e.pageX) * -1
    const sliderPosition = currentItem * itemWidth * dragСoefficient

    const maxDragDistance = sliderPosition >= sliderRange ? sliderRange : sliderPosition

    const translateX =
      maxDragDistance - diffFromStartPoint >= sliderRange
        ? sliderRange
        : maxDragDistance - diffFromStartPoint

    const currentItemStorage = Math.ceil(
      (translateX - thresholdToSlide * dragСoefficient) / dragСoefficient / itemWidth
    )

    setCurrentItem(currentItemStorage < 0 ? 0 : currentItemStorage)

    slider.style.transform = `translate3d(-${translateX / dragСoefficient}px, 0, 0)`
  }

  const onMouseUp = e => {
    if (!sliderAvailable || window.innerWidth <= mobileLayout) return
    e.preventDefault()

    setMouseUp(e.pageX)
    setDragging(false)

    slider.addEventListener("transitionend", blockLinksHandler)

    removeDragListeners()
  }

  const blockLinksHandler = () => {
    setBlockLinks(false)
    slider.removeEventListener("transitionend", blockLinksHandler)
  }

  const removeDragListeners = () => {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }

  const toggleArrows = () => {
    if (!sliderAvailable) return

    setLeftArrowVisible(!(currentItem <= 0))
    setrightArrowVisible(!(currentItem >= nonVisibleItems))
  }

  return (
    <div className="slider-container">
      <div
        onMouseDown={e => onMouseDown(e)}
        onMouseUp={e => onMouseUp(e)}
        className={dragging ? "slider s--dragging" : "slider"}
        ref={sliderRef}
      >
        {listOfContent.map(({ poster_path, original_title, id }) => {
          const mediaType = original_title ? "movie" : "show"
          return (
            <div key={id} className="slider__item-wrapper">
              <Link
                onClick={e => {
                  if (blockLinks) e.preventDefault()
                }}
                to={{
                  pathname: `/${mediaType}/${id}`
                }}
              >
                <div
                  className="slider__item"
                  style={{
                    backgroundImage: `url(${POSTER_PATH}${poster_path})`
                  }}
                />
              </Link>
            </div>
          )
        })}
      </div>
      {sliderAvailable && (
        <>
          <div
            onClick={() => pagination("left")}
            className={
              leftArrowVisible ? "arrow arrow--left" : "arrow arrow--left arrow--non-visible"
            }
          />
          <div
            onClick={() => pagination("right")}
            className={
              rightArrowVisible ? "arrow arrow--right" : "arrow arrow--right arrow--non-visible"
            }
          />
        </>
      )}
    </div>
  )
}
