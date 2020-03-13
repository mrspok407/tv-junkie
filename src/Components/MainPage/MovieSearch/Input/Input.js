import React, { Component } from "react"
import "./Input.scss"

export default class Input extends Component {
  componentDidMount() {
    if (this.inputRef) this.inputRef.focus()
  }

  render() {
    return (
      <div className="movie-search__input">
        <input
          ref={_input => {
            this.inputRef = _input
          }}
          type="text"
          placeholder="Search for a movie"
          value={this.props.query}
          onChange={this.props.handleChange}
          onKeyDown={this.props.resetSearch}
          onFocus={this.props.onFocus}
        />
        <button
          type="button"
          className="input-clear"
          onClick={this.props.resetSearchBtn}
        />
      </div>
    )
  }
}
