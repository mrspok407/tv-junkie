import React, { Component } from "react"
import debounce from "debounce"
import "./Input.scss"
import Loader from "../../../Placeholders/Loader"
import { mediaTypesArr } from "../../../../Utils"

export default class Input extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: "",
      mediaType: { type: "Multi", icon: mediaTypesArr[0].icon },
      mediaTypesIsOpen: false
    }

    this.mediaTypeRef = React.createRef()
  }

  componentDidMount() {
    if (this.inputRef) this.inputRef.focus()
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  _runSearch = media => {
    this.props.onSearch(this.state.query, media)
  }

  runSearchDeb = debounce(() => this._runSearch(this.state.mediaType), 300)

  resetSearch = () => this.setState({ query: "" }, this._runSearch)

  handleKeyDown = e => e.which === 27 && this.resetSearch()

  handleChange = e => {
    this.setState({ query: e.target.value }, this.runSearchDeb)
  }

  handleClickOutside = e => {
    if (
      this.mediaTypeRef.current &&
      !this.mediaTypeRef.current.contains(e.target)
    ) {
      this.setState({
        mediaTypesIsOpen: false
      })
    }
  }

  render() {
    return (
      <>
        {/* <div className="search__search-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ipc-icon ipc-icon--magnify"
            viewBox="0 0 24 24"
            fill="currentColor"
            role="presentation"
          >
            <path fill="none" d="M0 0h24v24H0V0z" />
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div> */}

        <div
          ref={this.mediaTypeRef}
          className="search__media-type"
          style={{
            backgroundImage: `url(${this.state.mediaType.icon})`
          }}
        >
          <button
            type="button"
            onClick={() =>
              this.setState(prevState => ({
                mediaTypesIsOpen: !prevState.mediaTypesIsOpen
              }))
            }
            className="media-type__button media-type__selected-value"
          >
            <span>
              {this.state.mediaType.type === "Multi"
                ? "All"
                : this.state.mediaType.type}
            </span>
          </button>
          {this.state.mediaTypesIsOpen && (
            <div className="media-type__options">
              <ul className="media-type__list">
                {mediaTypesArr.map(item => {
                  const type = item.type === "Multi" ? "All" : item.type
                  return (
                    <li
                      key={item.id}
                      className={
                        item.type === this.state.mediaType.type
                          ? "media-type__item media-type__item--selected"
                          : "media-type__item"
                      }
                      style={{ backgroundImage: `url(${item.icon})` }}
                    >
                      <button
                        type="button"
                        className="media-type__button"
                        value={item.type}
                        onClick={e => {
                          this.setState(
                            {
                              mediaType: {
                                type: e.target.value,
                                icon: item.icon
                              },
                              mediaTypesIsOpen: false
                            },
                            () => this._runSearch(this.state.mediaType)
                          )
                        }}
                      >
                        {type}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <input
          ref={_input => {
            this.inputRef = _input
          }}
          className="search__input"
          type="text"
          placeholder="Search"
          value={this.state.query}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onFocus={this.props.onFocus}
        />
        {this.props.isSearchingList && <Loader className="loader--input" />}
        {this.state.query && (
          <button
            type="button"
            className="button--input-clear"
            onClick={this.resetSearch}
          />
        )}
      </>
    )
  }
}
