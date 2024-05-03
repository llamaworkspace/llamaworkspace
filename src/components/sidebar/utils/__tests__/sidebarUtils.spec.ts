import { getChatsGroupedByDate } from '../sidebarUtils'

const NOW_DATE = new Date('2024-01-01T11:30:00Z')

const subject = (dates: Date[]) => {
  const chats = dates.map((date, index) => {
    return { id: (index + 1).toString(), title: 't', createdAt: date }
  })
  return getChatsGroupedByDate(chats)
}

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW_DATE.getTime())
})

afterEach(() => {
  jest.useRealTimers()
})

describe('sidebarUtils', () => {
  describe('getChatsGroupedByDate', () => {
    it('when date is today, it returns "today"', () => {
      const result = subject([new Date('2024-01-01T10:30:00Z')])

      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: 'Today',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    it('when date is yesterday, it returns "yesterday"', () => {
      const result = subject([new Date('2023-12-31T10:30:00Z')])

      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: 'Yesterday',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    it('when date is 6 days ago, it returns "previous7Days"', () => {
      const result = subject([new Date('2023-12-26T10:30:00Z')])

      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: 'Previous 7 days',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    it('when date is 7 days ago and a few hours, it returns "previous7Days"', () => {
      const result = subject([new Date('2023-12-25T10:00:00Z')])

      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: 'Previous 7 days',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    it('when date is 30 days ago and a few hours, it returns "previous30Days"', () => {
      const result = subject([new Date('2023-12-02T10:00:00Z')])

      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: 'Previous 30 days',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    it('when date is 31 days ago and still the same month, it returns the month', () => {
      const result = subject([new Date('2023-12-01T10:00:00Z')])
      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: 'December',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    it('when date is the previous month, it returns the month', () => {
      const result = subject([new Date('2023-11-30T10:00:00Z')])
      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: 'November',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    it('when date is over a year, it returns the year', () => {
      const result = subject([new Date('2023-01-30T10:00:00Z')])
      const result2 = subject([new Date('2022-12-30T10:00:00Z')])

      const firstElement = result[0]!

      expect(firstElement).toEqual(
        expect.objectContaining({
          label: '2023',
        }),
      )
      expect(firstElement.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )

      const firstElement2 = result2[0]!

      expect(firstElement2).toEqual(
        expect.objectContaining({
          label: '2022',
        }),
      )
      expect(firstElement2.chats).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
      )
    })

    describe('position', () => {
      it('when date is today, it returns "today"', () => {
        const result = subject([new Date('2024-01-01T10:30:00Z')])

        const firstElement = result[0]!

        expect(firstElement).toEqual(
          expect.objectContaining({
            label: 'Today',
          }),
        )
        expect(firstElement.chats).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: '1' })]),
        )
      })
    })
  })
})
