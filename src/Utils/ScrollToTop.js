import React, { Component } from "react"
import { throttle } from "throttle-debounce"

const scrollToTopThreshold = 1000

export default class scrollToTop extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollToTopShown: false,
      scrollToPreviousShown: false,
      savedY: 0
    }
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll)
  }

  handleScroll = throttle(200, () => {
    const { scrollToTopShown } = this.state
    const { scrollY } = window

    if (scrollY >= scrollToTopThreshold) {
      if (!scrollToTopShown) {
        this.setState({ scrollToTopShown: true, scrollToPreviousShown: false })
      }
    } else if (scrollToTopShown) {
      this.setState({ scrollToTopShown: false })
    }
  })

  scrollToTop = () => {
    console.log("test")
    this.setState({
      scrollToTopShown: false,
      scrollToPreviousShown: true,
      savedY: window.scrollY
    })
    window.scrollTo(0, 0)
  }

  scrollToPrevious = () => {
    this.setState({ scrollToTopShown: true, scrollToPreviousShown: false })
    window.scrollTo(0, this.state.savedY)
  }

  render() {
    return (
      <>
        {this.state.scrollToTopShown && (
          <div className="scroll-to scroll-to--top">
            <button type="button" onClick={this.scrollToTop} />
          </div>
        )}
        {this.state.scrollToPreviousShown && (
          <div className="scroll-to scroll-to--prev">
            <button type="button" onClick={this.scrollToPrevious} />
          </div>
        )}
      </>
    )
  }
}
