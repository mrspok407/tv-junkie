import React, { useState, useEffect, useMemo } from "react"

type Props = {
  timeStamp: number | null
}

const useTimestampFormater = ({ timeStamp }: Props) => {
  const [formatedDate, setFormatedDate] = useState<number | string | null>(timeStamp)

  useMemo(() => {
    console.log(timeStamp)
    if (!timeStamp) {
      setFormatedDate(null)
      return
    }
    const todayDate = new Date()
    const timeStampDate = new Date(timeStamp!)
    // const todayDateEpoch = todayDate.getTime()
    // const timeStampDateEpoch = timeStampDate.getTime()
    // const oneDayInMilliseconds = 60 * 1000 * 60 * 24

    const timeStampDay = timeStampDate.toLocaleDateString()
    const todayDay = todayDate.toLocaleDateString()
    const yesterdayDay = new Date(new Date(new Date().setDate(new Date().getDate() - 1))).toLocaleDateString()

    const timeStampTime = new Date(Number(timeStamp)).toLocaleTimeString().slice(0, -3)

    if (timeStampDay === todayDay) {
      setFormatedDate(timeStampTime)
    } else if (timeStampDay === yesterdayDay) {
      setFormatedDate("Yesterday")
    } else {
      setFormatedDate(timeStampDay!)
    }
  }, [timeStamp])

  return formatedDate
}

export default useTimestampFormater
