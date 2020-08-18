import React, { Component } from "react"
import { withUserContent } from "Components/UserContent"
import "./GridTests.scss"

const POSTER_URL = "https://image.tmdb.org/t/p/w500"

class GridTests extends Component {
  constructor(props) {
    super(props)

    this.state = {
      content: []
    }
  }

  componentDidMount() {
    this.setState({ content: this.props.userContent.watchingShows.slice(0, 10) })
  }

  deleteItem = id => {
    this.setState(prevState => ({
      content: [...prevState.content.filter(item => item.id !== id)]
    }))
  }

  render() {
    const content = this.state.content
    return (
      <div className="grid">
        <div className={`grid__items grid__items--${content.length}`}>
          {content.map(({ poster_path, id }) => (
            <div
              onClick={() => this.deleteItem(id)}
              key={id}
              className="grid__item"
              style={{ backgroundImage: `url('${POSTER_URL}${poster_path}')` }}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withUserContent(GridTests)
