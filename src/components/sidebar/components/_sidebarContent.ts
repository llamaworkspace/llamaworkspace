/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const */
import { FolderIcon, HomeIcon, UsersIcon } from '@heroicons/react/24/outline'
import _ from 'underscore'

export const navigation = [
  { name: 'Not done yet', href: '#', icon: HomeIcon, current: true },
  { name: 'Team', href: '#', icon: UsersIcon, current: false },
  { name: 'Projects', href: '#', icon: FolderIcon, current: false },
  // { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
  // { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
  // { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
]

const firstTeamEl = {
  id: 1,
  name: 'International kids names that could work in any country on the planet',
  href: '#',
  initial: 'H',
  current: false,
}

let _teams = [
  firstTeamEl,
  {
    id: 2,
    name: 'Typed Global State Context',
    href: '#',
    initial: '🤡',
    current: false,
  },
  {
    id: 3,
    name: 'Easy Hiking Routes Vall.',
    href: '#',
    initial: '🧑‍🎓',
    current: false,
  },
]

export let teams: (typeof firstTeamEl)[] = []

Array.from({ length: 0 }).forEach((_, i) => {
  teams = [
    // @ts-ignore
    ...teams,
    // @ts-ignore
    _teams.map((team) => ({ ...team, id: team.id + (3 * i + 1) })),
  ]
})

teams = _.flatten(teams)

export const chats = teams.slice(0, 3)
