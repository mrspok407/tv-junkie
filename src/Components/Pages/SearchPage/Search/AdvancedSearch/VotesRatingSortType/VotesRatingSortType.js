import React from "react"
import SelectInput from "../InputTemplates/SelectInput/SelectInput"
import { range, sortBy } from "Utils"

export default function VotesRatingSort({ handleChange }) {
  return (
    <>
      <div className="inputs__rating">
        <SelectInput label="Rating" name="rating" onChange={e => handleChange(e)}>
          <option />
          {range(1, 10, 1)
            .reverse()
            .map(item => (
              <option key={item} value={item}>
                {item}+
              </option>
            ))}
        </SelectInput>
      </div>
      <div className="inputs__vote-count">
        <SelectInput label="Vote Count" name="voteCount" onChange={e => handleChange(e)}>
          <option />
          {range(500, 5000, 500)
            .reverse()
            .map(item => (
              <option key={item} value={item}>
                {item}+
              </option>
            ))}
          <option value="50+">50+</option>
        </SelectInput>
      </div>
      <div className="inputs__sortby">
        <SelectInput label="Sort by" name="sortBy" onChange={e => handleChange(e)}>
          {sortBy.map(item => (
            <option key={item.name} value={item.codeName}>
              {item.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <div className="inputs__media-type">
        <SelectInput label="Media Type" name="mediaType" onChange={e => handleChange(e)}>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </SelectInput>
      </div>
    </>
  )
}
