import React, { Component } from "react"

export default class PlaceholderNoResults extends Component {
  componentDidMount() {
    document.addEventListener("mousedown", this.props.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.props.handleClickOutside)
  }

  render() {
    return (
      <div className={`placeholder--no-results ${this.props.className || ""}`}>
        {this.props.message}
      </div>
    )
  }
}
