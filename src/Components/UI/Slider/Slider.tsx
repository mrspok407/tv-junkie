/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import debounce from 'debounce'
import classNames from 'classnames'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import './Slider.scss'

const POSTER_PATH = 'https://image.tmdb.org/t/p/w500/'

export const Slider = ({ sliderData }: { sliderData: MainDataTMDB[] }) => {
  const [slider, setSlider] = useState<HTMLDivElement>(null!)
  const [sliderWidth, setSliderWidth] = useState<number>(null!)

  if (slider) slider.style.setProperty('--sliderWidth', `${sliderWidth}px`)

  const mobileLayout = slider && Number(getComputedStyle(slider).getPropertyValue('--mobileLayout'))

  const itemsInRow = slider && Number(getComputedStyle(slider).getPropertyValue('--itemsInRow'))
  const itemWidth = sliderWidth / itemsInRow

  const itemsInSlider = sliderData.length
  const nonVisibleItems = itemsInSlider - itemsInRow
  const dragCoefficient = 1.25
  const thresholdToSlide = itemWidth / 2
  const sliderRange = nonVisibleItems * itemWidth * dragCoefficient
  const sliderAvailable = itemsInSlider > itemsInRow

  const [currentItem, setCurrentItem] = useState(0)
  const [mouseUp, setMouseUp] = useState<number>()

  const [dragging, setDragging] = useState(false)
  const [blockLinks, setBlockLinks] = useState(false)

  const [leftArrowVisible, setLeftArrowVisible] = useState(true)
  const [rightArrowVisible, setRightArrowVisible] = useState(true)

  const isMountedRef = useRef(false)

  let startDragPoint = 0

  const sliderRef = useCallback((node: any) => {
    if (node !== null) {
      setSlider(node)
    }
  }, [])

  const handleResize = useCallback(() => {
    if (!slider) return

    if (window.innerWidth <= mobileLayout) {
      slider.classList.add('s--mobile')
      slider.style.cssText = ''
    }

    if (!isMountedRef.current) return
    setSliderWidth(slider.getBoundingClientRect().width)
  }, [slider])

  const handleResizeDeb = debounce(() => handleResize(), 200)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useLayoutEffect(() => {
    if (!slider) return

    handleResize()

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => handleResizeDeb())
      resizeObserver.observe(slider)

      return () => {
        if (!resizeObserver) return

        resizeObserver.disconnect()
        removeDragListeners()
      }
    }

    window.addEventListener('resize', handleResizeDeb)
    return () => {
      window.removeEventListener('resize', handleResizeDeb)
    }
  }, [slider])

  useEffect(() => {
    if (!slider) return

    slider.style.transform = `translate3d(-${currentItem * itemWidth}px, 0, 0)`
    slider.style.transition = '500ms'

    toggleArrows()
  }, [currentItem, mouseUp])

  useEffect(() => {
    if (!slider) return

    slider.style.transform = `translate3d(-${currentItem * itemWidth}px, 0, 0)`
  }, [itemWidth])

  useEffect(() => {
    if (currentItem > nonVisibleItems) {
      setCurrentItem(nonVisibleItems)
    }
    toggleArrows()
  }, [itemsInRow])

  const pagination = (direction: string) => {
    if (currentItem === 0 && direction === 'left') return
    if (nonVisibleItems === currentItem && direction === 'right') return

    if (direction === 'right') {
      if (currentItem > nonVisibleItems - itemsInRow) {
        setCurrentItem(nonVisibleItems)
      } else {
        setCurrentItem(currentItem + itemsInRow)
      }
    } else if (direction === 'left') {
      if (currentItem <= itemsInRow) {
        setCurrentItem(0)
      } else {
        setCurrentItem(currentItem - itemsInRow)
      }
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (!sliderAvailable || window.innerWidth <= mobileLayout || e.button !== 0) return
    e.preventDefault()

    setDragging(true)

    startDragPoint = e.pageX

    document.addEventListener<any>('mousemove', onMouseMove)
    document.addEventListener<any>('mouseup', onMouseUp)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!sliderAvailable || window.innerWidth <= mobileLayout) return
    e.preventDefault()
    setBlockLinks(true)

    const diffFromStartPoint = (startDragPoint - e.pageX) * -1
    const sliderPosition = currentItem * itemWidth * dragCoefficient

    const maxDragDistance = sliderPosition >= sliderRange ? sliderRange : sliderPosition

    const translateX =
      maxDragDistance - diffFromStartPoint >= sliderRange ? sliderRange : maxDragDistance - diffFromStartPoint

    const currentItemStorage = Math.ceil(
      (translateX - thresholdToSlide * dragCoefficient) / dragCoefficient / itemWidth,
    )

    setCurrentItem(currentItemStorage < 0 ? 0 : currentItemStorage)

    slider.style.transform = `translate3d(-${translateX / dragCoefficient}px, 0, 0)`
    slider.style.transition = '0ms'
  }

  const onMouseUp = (e: React.MouseEvent) => {
    if (!sliderAvailable || window.innerWidth <= mobileLayout) return
    e.preventDefault()

    setMouseUp(e.pageX)
    setDragging(false)

    slider.addEventListener('transitionend', blockLinksHandler)

    removeDragListeners()
  }

  const blockLinksHandler = () => {
    setBlockLinks(false)
    slider.removeEventListener('transitionend', blockLinksHandler)
  }

  const removeDragListeners = () => {
    document.removeEventListener<any>('mousemove', onMouseMove)
    document.removeEventListener<any>('mouseup', onMouseUp)
  }

  const toggleArrows = () => {
    if (!sliderAvailable) return

    setLeftArrowVisible(!(currentItem <= 0))
    setRightArrowVisible(!(currentItem >= nonVisibleItems))
  }

  return (
    <div className="slider-container">
      <div
        onMouseDown={(e) => onMouseDown(e)}
        onMouseUp={(e) => onMouseUp(e)}
        className={classNames('slider', {
          's--dragging': dragging,
        })}
        ref={sliderRef}
        role="slider"
        aria-valuenow={200}
        tabIndex={0}
      >
        {sliderData.map(({ poster_path, original_title, id }) => {
          const mediaType = original_title ? 'movie' : 'show'
          return (
            <div key={id} className="slider__item-wrapper">
              <Link
                onClick={(e) => {
                  if (blockLinks) e.preventDefault()
                }}
                to={`/${mediaType}/${id}`}
              >
                <div className="slider__item lazyload" data-bg={`${POSTER_PATH}${poster_path}`} />
              </Link>
            </div>
          )
        })}
      </div>
      {sliderAvailable && (
        <>
          <div
            onClick={() => pagination('left')}
            className={classNames('arrow arrow--left', {
              'arrow--non-visible': !leftArrowVisible,
            })}
            role="button"
            tabIndex={0}
            aria-label="Pagination left"
          />
          <div
            onClick={() => pagination('right')}
            className={classNames('arrow arrow--right', {
              'arrow--non-visible': !rightArrowVisible,
            })}
            role="button"
            tabIndex={0}
            aria-label="Pagination right"
          />
        </>
      )}
    </div>
  )
}

export default Slider
