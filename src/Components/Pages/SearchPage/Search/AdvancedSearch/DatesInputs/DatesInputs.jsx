import React from 'react'
import { range } from 'Utils'
import SelectInput from '../InputTemplates/SelectInput/SelectInput'

const currentYear = new Date().getFullYear()

const DatesInputs = ({ setFieldValue, handleChange }) => {
  return (
    <>
      <div className="inputs__dates-year">
        <SelectInput
          label="Year"
          name="year"
          onChange={(e) => {
            handleChange(e)
            setFieldValue('decade', '')
            setFieldValue('yearFrom', '')
            setFieldValue('yearTo', '')
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
            setFieldValue('year', '')
            setFieldValue('yearFrom', '')
            setFieldValue('yearTo', '')
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
              setFieldValue('decade', '')
              setFieldValue('year', '')
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
              setFieldValue('decade', '')
              setFieldValue('year', '')
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

export default DatesInputs
