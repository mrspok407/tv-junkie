import React from "react"
import SelectInput from "../InputTemplates/SelectInput/SelectInput"
import { range } from "Utils"

const currentYear = new Date().getFullYear()

export default function DatesInputs({
  setFieldValue,
  handleChange
  // year,
  // changeYear
}) {
  // const [yearIsOpen, setYearIsOpen] = useState(false)
  return (
    <>
      <div className="inputs__dates-year">
        {/* <div className="search__media-type">
          <button
            type="button"
            onClick={() => setYearIsOpen(!yearIsOpen)}
            className="media-type__button media-type__selected-value"
          >
            <span>{year}</span>
          </button>
          {yearIsOpen && (
            <div className="media-type__options">
              <ul className="media-type__list">
                {range(1900, currentYear, 1)
                  .reverse()
                  .map(item => {
                    return (
                      <li
                        key={item}
                        className={
                          item === year
                            ? "media-type__item media-type__item--selected"
                            : "media-type__item"
                        }
                      >
                        <button
                          type="button"
                          className="media-type__button"
                          value={item}
                          onClick={e => {
                            changeYear(e.target.value)
                            setYearIsOpen(false)
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    )
                  })}
              </ul>
            </div>
          )}
        </div> */}
        <SelectInput
          label="Year"
          name="year"
          onChange={(e) => {
            handleChange(e)
            setFieldValue("decade", "")
            setFieldValue("yearFrom", "")
            setFieldValue("yearTo", "")
          }}
        >
          <option />
          {range(1900, currentYear, 1)
            .reverse()
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </SelectInput>
      </div>
      <div className="inputs__dates-decade">
        <SelectInput
          label="Decade"
          name="decade"
          onChange={(e) => {
            handleChange(e)
            setFieldValue("year", "")
            setFieldValue("yearFrom", "")
            setFieldValue("yearTo", "")
          }}
        >
          <option />
          {range(1900, currentYear, 10)
            .reverse()
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </SelectInput>
      </div>
      <div className="inputs__dates-range">
        <div className="dates-range__from">
          <SelectInput
            label="From"
            name="yearFrom"
            onChange={(e) => {
              handleChange(e)
              setFieldValue("decade", "")
              setFieldValue("year", "")
            }}
          >
            <option />
            {range(1900, currentYear, 1)
              .reverse()
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </SelectInput>
        </div>
        <div className="dates-range__to">
          <SelectInput
            label="To"
            name="yearTo"
            onChange={(e) => {
              handleChange(e)
              setFieldValue("decade", "")
              setFieldValue("year", "")
            }}
          >
            <option />
            {range(1900, currentYear, 1)
              .reverse()
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </SelectInput>
        </div>
      </div>
    </>
  )
}
