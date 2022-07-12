export default function sortDataSnapshot<Type>(snapshot: any): Type {
  if (snapshot.val() === null) return [] as any
  const data: any = []
  snapshot.forEach((item: { val: () => Type; key: string }) => {
    data.push({ ...item.val(), key: item.key })
  })
  return data
}
