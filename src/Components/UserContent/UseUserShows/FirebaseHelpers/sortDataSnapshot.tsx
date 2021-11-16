export default function sortDataSnapshot<Type>(snapshot: any): Type[] {
  const data: Type[] = []
  snapshot.forEach((item: { val: () => Type; key: string }) => {
    data.push({ ...item.val(), key: item.key })
  })
  return data
}
