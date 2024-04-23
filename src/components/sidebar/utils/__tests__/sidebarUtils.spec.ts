import { getChatsGroupedByDate } from '../sidebarUtils'

const NOW_DATE = new Date('2024-01-01T11:30:00Z')

const subject = (date: Date) => {
  const chats = [{ id: '1', title: 't', createdAt: date }]
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
      const result = subject(new Date('2024-01-01T10:30:00Z'))
      expect(Object.keys(result)).toEqual(expect.arrayContaining(['Today']))
    })

    it('when date is yesterday, it returns "yesterday"', () => {
      const result = subject(new Date('2023-12-31T10:30:00Z'))
      expect(Object.keys(result)).toEqual(expect.arrayContaining(['Yesterday']))
    })

    it('when date is 6 days ago, it returns "previous7Days"', () => {
      const result = subject(new Date('2023-12-26T10:30:00Z'))
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(['Previous 7 days']),
      )
    })

    it('when date is 7 days ago and a few hours, it returns "previous7Days"', () => {
      const result = subject(new Date('2023-12-25T10:00:00Z'))
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(['Previous 7 days']),
      )
    })

    it('when date is 30 days ago and a few hours, it returns "previous30Days"', () => {
      const result = subject(new Date('2023-12-02T10:00:00Z'))
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(['Previous 30 days']),
      )
    })

    it('when date is 31 days ago and still the same month, it returns the month', () => {
      const result = subject(new Date('2023-12-01T10:00:00Z'))
      expect(Object.keys(result)).toEqual(expect.arrayContaining(['December']))
    })

    it('when date is the previous month, it returns the month', () => {
      const result = subject(new Date('2023-11-30T10:00:00Z'))
      expect(Object.keys(result)).toEqual(expect.arrayContaining(['November']))
    })

    it('when date is over a year, it returns the year', () => {
      const result = subject(new Date('2023-01-30T10:00:00Z'))
      expect(Object.keys(result)).toEqual(expect.arrayContaining(['2023']))

      const result2 = subject(new Date('2022-12-30T10:00:00Z'))
      expect(Object.keys(result2)).toEqual(expect.arrayContaining(['2022']))
    })
  })
})
