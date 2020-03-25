import React, { Component } from "react"
import debounce from "debounce"

export default class scrollToTop extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showScrollToTop: false
    }
  }

  componentDidMount() {
    document.addEventListener(
      "scroll",
      debounce(() => this.toggleShowToTop(), 50)
    )
  }

  toggleShowToTop = () => {
    this.setState({
      showScrollToTop: window.pageYOffset > 600
    })
  }

  toggleScrollToTop = () => {
    window.scrollTo({
      top: 0
    })
  }

  render() {
    return (
      <>
        {this.state.showScrollToTop && (
          <div className="scroll-top">
            <button type="button" onClick={() => this.toggleScrollToTop()} />
          </div>
        )}
      </>
    )
  }
}
