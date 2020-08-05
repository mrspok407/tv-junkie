import React, { Component } from "react"
import { compose } from "recompose"
import { withUserContent } from "Components/UserContent"
import classNames from "classnames"
import "./UserRating.scss"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"

const STAR_AMOUNT = 5

class UserRating extends Component {
  constructor(props) {
    super(props)

    this.state = {
      userRating: null,
      nonAuthWarning: false
    }

    this.userRatingRef = React.createRef()
  }

  componentDidMount() {
    this.getRating()
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  getRating = () => {
    if (this.props.authUser === null) return

    this.props.userContent.showsDatabases.forEach(database => {
      // this.props.firebase
      //   .userShow(this.props.authUser.uid, Number(this.props.id), database)
      this.props.firebase[this.props.firebaseRef](
        this.props.authUser.uid,
        Number(this.props.id),
        database,
        this.props.seasonNum,
        this.props.episodeNum
      ).on("value", snapshot => {
        if (snapshot.val() === null) return

        this.setState({
          userRating: snapshot.val().userRating
        })
      })
    })
  }

  onMouseEnterHandler = e => {
    if (this.props.authUser === null) return

    const buttonsNodeList = e.target.parentElement.getElementsByClassName("user-rating__button")
    const currentRating = e.target.dataset.rating

    Array.from(buttonsNodeList).forEach((star, index) => {
      if (index + 1 <= currentRating) {
        star.classList.add("user-rating__button-hovered")
      }
      if (index + 1 > currentRating) {
        star.classList.remove("user-rating__button-rated")
      }
    })
  }

  onMouseLeaveHandler = e => {
    if (this.props.authUser === null) return

    const buttonsNodeList = e.target.parentElement.getElementsByClassName("user-rating__button")

    Array.from(buttonsNodeList).forEach((star, index) => {
      star.classList.remove("user-rating__button-hovered")

      if (index + 1 <= this.state.userRating) {
        star.classList.add("user-rating__button-rated")
      }
    })
  }

  onClickHandler = e => {
    if (this.props.authUser === null) return

    const rating = e.target.dataset.rating

    this.props.userContent.showsDatabases.forEach(database => {
      // this.props.firebase
      //   .userShow(this.props.authUser.uid, Number(this.props.id), database)
      this.props.firebase[this.props.firebaseRef](
        this.props.authUser.uid,
        Number(this.props.id),
        database,
        this.props.seasonNum,
        this.props.episodeNum
      ).once("value", snapshot => {
        if (snapshot.val() === null) return

        this.props.firebase[this.props.firebaseRef](
          this.props.authUser.uid,
          Number(this.props.id),
          database,
          this.props.seasonNum,
          this.props.episodeNum
        ).update({ userRating: rating, watched: true })
      })
    })
  }

  handleClickOutside = e => {
    if (this.userRatingRef.current && !this.userRatingRef.current.contains(e.target)) {
      this.setState({
        nonAuthWarning: false
      })
    }
  }

  render() {
    const disableRating =
      this.props.authUser === null || (this.props.showDatabase === null && this.props.fullContentPage)
    return (
      <div
        ref={this.userRatingRef}
        className="user-rating"
        onClick={() => {
          if (this.props.authUser !== null) return
          this.setState({ nonAuthWarning: !this.state.nonAuthWarning })
        }}
      >
        {[...Array(STAR_AMOUNT).keys()].map(n => (
          <button
            key={n}
            data-rating={n + 1}
            type="button"
            className={classNames("user-rating__button", {
              "user-rating__button-rated": n + 1 <= this.state.userRating,
              "user-rating__button--disabled": disableRating
            })}
            onMouseEnter={!disableRating ? this.onMouseEnterHandler : undefined}
            onMouseLeave={!disableRating ? this.onMouseLeaveHandler : undefined}
            onClick={!disableRating ? this.onClickHandler : undefined}
          ></button>
        ))}

        {this.state.nonAuthWarning && (
          <div className="user-rating__warning">
            To use full features please <Link to={ROUTES.LOGIN_PAGE}>register</Link>. Your allready selected
            shows will be saved.
          </div>
        )}
      </div>
    )
  }
}
export default compose(withUserContent)(UserRating)
