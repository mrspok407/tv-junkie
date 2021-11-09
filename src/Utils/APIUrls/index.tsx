export const tmdbTvSeasonURL = ({ showId, seasonNum }: { showId: number; seasonNum: number }) => {
  if (showId === undefined || showId === null || seasonNum === undefined || seasonNum === null) return undefined
  return `https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=season/${seasonNum}`
}
