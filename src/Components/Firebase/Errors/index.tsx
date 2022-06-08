export const throwErrorNoData = () => {
  throw new Error(
    "There's no data in database, by this path. And if this function is called the data should be here.\n" +
      'Find out the reason why the data is missing at the point of calling this function.',
  )
}
