import React, { useState, useEffect, useMemo } from "react"

type Props = {
  timeStamp: string | null
}

const useTimestampFormater = ({ timeStamp }: Props) => {
  const [formatedDate, setFormatedDate] = useState<string | null>(timeStamp)

  useMemo(() => {
    const todayDate = new Date()
    const timeStampDate = new Date(Number(timeStamp))
    const todayDateEpoch = todayDate.getTime()
    const timeStampDateEpoch = timeStampDate.getTime()
    const oneDayInMilliseconds = 60 * 1000 * 60 * 24

    const timeStampDay = timeStampDate.toLocaleDateString()
    const todayDay = todayDate.toLocaleDateString()
    const yesterdayDay = new Date(new Date(new Date().setDate(new Date().getDate() - 1))).toLocaleDateString()

    const timeStampTime = new Date(Number(timeStamp)).toLocaleTimeString().slice(0, -3)

    if (timeStampDay === todayDay) {
      setFormatedDate(timeStampTime)
    }
    if (timeStampDay === yesterdayDay) {
      setFormatedDate("Yesterday")
    }
    if (todayDateEpoch - timeStampDateEpoch > oneDayInMilliseconds * 2) {
      setFormatedDate(timeStampDay)
    }
  }, [timeStamp])

  return formatedDate
}

export default useTimestampFormater
