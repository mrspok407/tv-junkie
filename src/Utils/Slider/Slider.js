/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-use-before-define */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useRef, useEffect, useState } from "react"
import debounce from "debounce"
import { Link } from "react-router-dom"
import "./Slider.scss"

export default function Slider({ listOfContent }) {
  const slider = useRef()
  const arrowLeft = useRef()
  const arrowRight = useRef()
  const rootNode = document.documentElement

  const itemsInRowData = {
    desktop: {
      windowSize: 800,
      items: 5
    },
    tablet: {
      windowSize: 500,
      items: 4
    },
    mobile: {
      items: 3
    }
  }

  const [itemWidth, setItemWidth] = useState()
  const [itemsInRow, setItemsInRow] = useState()

  const itemsInSlider = listOfContent.length
  const nonVisibleItems = itemsInSlider - itemsInRow
  const dragСoefficient = 1.25 // Это чтобы translate3d(*значение*, 0, 0) по факту было на 25% меньше, чем реальная дистанция курсора. хз как назвать
  const thresholdToSlide = itemWidth / 2
  const widthOfSlider = nonVisibleItems * itemWidth * dragСoefficient
  const transition = 500
  const sliderAvailable = itemsInSlider > itemsInRow

  const [currentItem, setCurrentItem] = useState(0)
  const [mouseUp, setMouseUp] = useState()

  let startDragPoint = 0

  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    updateDimensions()

    window.addEventListener("resize", resizeHandler)

    return removeDragListeners()
  })

  useEffect(() => {
    slider.current.style.transform = `translate3d(-${currentItem *
      itemWidth}px, 0, 0)`
    slider.current.style.transition = `${transition}ms`

    toggleArrows()
  }, [currentItem, mouseUp])

  useEffect(() => {
    // Чтобы при изменение ширины слайда, слайдер переехал куда надо ровно. А то ширина изменится, но слайдер останется в том же положение
    slider.current.style.transform = `translate3d(-${currentItem *
      itemWidth}px, 0, 0)`
  }, [itemWidth])

  useEffect(() => {
    // Если допустим при itemsInRow = 4 (nonVisibleItems при этом будет 16), ты находишься на последнем слайде (currentItem будет равен 16)
    // и увеличиваешь ширину окна, чтобы itemsInRow стало 5 (nonVisibleItems при этом будет 15), то currentItem по-прежнему 16 останется
    // слайдер будет смещён на 16 позиций грубо говоря, хотя их максимум 15 (при itemsInRow = 5). Поэтому обоновляю currentItem на основе изменения
    // itemsInRow, только если curItem больше nonVisibleItems (а он обновится за счёт изменения itemsInRow).
    if (currentItem > nonVisibleItems) {
      setCurrentItem(nonVisibleItems)
    }
    toggleArrows()
  }, [itemsInRow])

  const resizeHandler = debounce(() => updateDimensions(), 300)

  const updateDimensions = () => {
    // Вот это говно если не тут деклерить, а вне функции то там рофлы иногда появляются с тем что undefined хз
    const slideWrapper = document.querySelector(".slider__item-wrapper")
    const sliderCont = document.querySelector(".slider")
    const sliderContWidth = sliderCont.offsetWidth

    setItemWidth(slideWrapper.offsetWidth)
    rootNode.style.setProperty("--sliderWidth", `${sliderContWidth}px`)

    sliderCont.style.transition = "0s"

    itemsInRowUpdater()
  }

  const itemsInRowUpdater = () => {
    const windowWidth = window.innerWidth
    const itemData = itemsInRowData

    const itemsInRowStorage =
      windowWidth >= itemData.desktop.windowSize
        ? itemData.desktop.items
        : windowWidth >= itemData.tablet.windowSize &&
          windowWidth < itemData.desktop.windowSize
        ? itemData.tablet.items
        : itemData.mobile.items

    rootNode.style.setProperty("--itemsInRow", `${itemsInRowStorage}`)

    setItemsInRow(itemsInRowStorage)
  }

  const pagination = direction => {
    if (currentItem === 0 && direction === "left") return
    if (nonVisibleItems === currentItem && direction === "right") return

    // Это всё, чтобы если ты драгом перешел на допустим 3й с конца слайд (то есть справа еще 2 слайда спрятаны)
    // то контейнер не прыгнул на itemsInRow, а прыгнул на 2 (столько сколько скрыто еще).
    // Тоже самое с обратной стороны
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
    if (!sliderAvailable) return
    e.preventDefault()

    startDragPoint = e.pageX
    slider.current.style.transition = "0s"

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const onMouseMove = e => {
    if (!sliderAvailable) return
    e.preventDefault()

    setDragging(true)

    const slideDistance = (startDragPoint - e.pageX) * -1
    const sliderPosition = currentItem * itemWidth * dragСoefficient

    const maxDragDistance =
      sliderPosition >= widthOfSlider ? widthOfSlider : sliderPosition

    const translateX =
      maxDragDistance - slideDistance >= widthOfSlider
        ? widthOfSlider
        : maxDragDistance - slideDistance

    // Высчитываю на каком слайде нахожусь на основе общей пройденной дистанции слайдера (прошлое положение и плюс текущий маус эвент скоко он прошел)
    const currentItemStorage = Math.ceil(
      (translateX - thresholdToSlide * dragСoefficient) /
        dragСoefficient /
        itemWidth
    )

    setCurrentItem(currentItemStorage < 0 ? 0 : currentItemStorage) // Там иногда -1 получается, рофланПоминки

    slider.current.style.transform = `translate3d(-${translateX /
      dragСoefficient}px, 0, 0)`
    slider.current.style.transition = "0s"
  }

  const onMouseUp = e => {
    if (!sliderAvailable) return
    e.preventDefault()

    setMouseUp(e.pageX) // Запихиваю в стейт хуйню уникальную, чтобы в useEffect определять, что был маусАп и сделай необходимую хуйню. Строка 56

    setTimeout(() => {
      setDragging(false)
    }, transition)

    removeDragListeners()
  }

  const removeDragListeners = () => {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }

  const toggleArrows = () => {
    if (!sliderAvailable) return

    arrowLeft.current.style.display = currentItem <= 0 ? "none" : "inherit"
    arrowRight.current.style.display =
      currentItem >= nonVisibleItems ? "none" : "inherit"
  }

  return (
    <div className="slider-container">
      <div
        onMouseDown={e => onMouseDown(e)}
        onMouseUp={e => onMouseUp(e)}
        className="slider"
        ref={slider}
      >
        {listOfContent.map(({ poster_path, original_title, id }) => {
          const mediaType = original_title ? "movie" : "show"
          return (
            <div key={id} className="slider__item-wrapper">
              <Link
                onClick={e => {
                  if (dragging) e.preventDefault() // Чтобы драгинге и маусАп не было рандомных нажатий
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
      {sliderAvailable && (
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
