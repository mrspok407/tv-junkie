import React, { useState, useRef, useEffect } from "react"
import classNames from "classnames"
import CheckboxInput from "../InputTemplates/CheckboxInput"

export default function GenreInputs({ toggleGenre, genres }) {
  const [withGenresOpen, setWithGenresOpen] = useState(false)
  const [withoutGenresOpen, setWithoutGenresOpen] = useState(false)

  const refWrapper = useRef()

  function handleClickOutside(e) {
    if (refWrapper.current && !refWrapper.current.contains(e.target)) {
      setWithGenresOpen(false)
      setWithoutGenresOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  })

  return (
    <div ref={refWrapper} className="inputs__genres">
      <div className="inputs__genres-select inputs__genres-select--with">
        <button
          type="button"
          onClick={() => setWithGenresOpen(!withGenresOpen)}
          className="inputs__genres-button"
        >
          With genres
        </button>
        {withGenresOpen && (
          <div className="inputs__genres-list">
            <div className="inputs__genres-checkbox-wrapper">
              {genres.map(({ id, name, isChecked, withoutGenre }) => {
                return (
                  <CheckboxInput
                    key={id}
                    checked={withoutGenre ? !isChecked : isChecked}
                    label={name}
                    name={name.toLowerCase()}
                    value={name.toLowerCase()}
                    onChange={toggleGenre}
                    data="withGenre"
                    disabled={!!withoutGenre}
                    className={classNames("checkbox-genre", {
                      "checkbox-genre--disabled": withoutGenre
                    })}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="inputs__genres-select">
        <button
          type="button"
          onClick={() => setWithoutGenresOpen(!withoutGenresOpen)}
          className="inputs__genres-button"
        >
          Without genres
        </button>
        {withoutGenresOpen && (
          <div className="inputs__genres-list">
            <div className="inputs__genres-checkbox-wrapper">
              {genres.map(({ id, name, isChecked, withGenre }) => {
                return (
                  <CheckboxInput
                    key={id}
                    checked={withGenre ? !isChecked : isChecked}
                    label={name}
                    name={name.toLowerCase()}
                    value={name.toLowerCase()}
                    onChange={toggleGenre}
                    data="withoutGenre"
                    disabled={!!withGenre}
                    className={classNames("checkbox-genre", {
                      "checkbox-genre--disabled": withGenre
                    })}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
