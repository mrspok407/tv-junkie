import React, { useState, useRef, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import useClickOutside from 'Utils/Hooks/UseClickOutside'
import CheckboxInput from '../InputTemplates/CheckboxInput'

const GenreInputs = ({ toggleGenre, genres }) => {
  const [withGenresOpen, setWithGenresOpen] = useState(false)
  const [withoutGenresOpen, setWithoutGenresOpen] = useState(false)

  const ref = useRef<any>(null)
  const handleClickOutside = useCallback(() => {
    setWithGenresOpen(false)
    setWithoutGenresOpen(false)
  }, [])
  useClickOutside({ ref, callback: handleClickOutside })

  return (
    <div ref={ref} className="inputs__genres">
      <div className="inputs__genres-select inputs__genres-select--with">
        <button type="button" onClick={() => setWithGenresOpen(!withGenresOpen)} className="inputs__genres-button">
          With genres
        </button>
        {withGenresOpen && (
          <div className="inputs__genres-list">
            <div className="inputs__genres-checkbox-wrapper">
              {genres.map(({ id, name, isChecked, withoutGenre }) => (
                <CheckboxInput
                  key={id}
                  checked={withoutGenre ? !isChecked : isChecked}
                  label={name}
                  name={name.toLowerCase()}
                  value={name.toLowerCase()}
                  onChange={toggleGenre}
                  data="withGenre"
                  disabled={!!withoutGenre}
                  className={classNames('checkbox-genre', {
                    'checkbox-genre--disabled': withoutGenre,
                  })}
                />
              ))}
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
              {genres.map(({ id, name, isChecked, withGenre }) => (
                <CheckboxInput
                  key={id}
                  checked={withGenre ? !isChecked : isChecked}
                  label={name}
                  name={name.toLowerCase()}
                  value={name.toLowerCase()}
                  onChange={toggleGenre}
                  data="withoutGenre"
                  disabled={!!withGenre}
                  className={classNames('checkbox-genre', {
                    'checkbox-genre--disabled': withGenre,
                  })}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenreInputs
