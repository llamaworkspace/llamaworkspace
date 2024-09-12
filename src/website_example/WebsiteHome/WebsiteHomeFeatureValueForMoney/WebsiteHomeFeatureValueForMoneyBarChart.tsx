import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { useIntersectionObserver } from 'usehooks-ts'

// Data for our bars
const bars = [
  {
    outsideChartText: 'Joia',
    insideChartText: '$7 (average)',
    value: 7,
    colorClass: 'bg-green-600',
    textClass: ' text-white',
    openWidthClass: 'w-[110px]',
  },
  {
    outsideChartText: 'ChatGPT Plus',
    insideChartText: '$20',
    value: 20,
    colorClass: 'bg-zinc-200',
    textClass: ' text-zinc-900',
    openWidthClass: 'w-[314px]',
  },
  {
    outsideChartText: 'ChatGPT Business (Rumored)',
    insideChartText: '$30',
    value: 30,
    colorClass: 'bg-zinc-200',
    textClass: ' text-zinc-900',
    openWidthClass: 'w-[471px]',
  },
]

interface AntimatedBarProps {
  insideChartText: string
  outsideChartText: string
  closedWidthClass: string
  openWidthClass: string
  chartColorClass: string
  chartTextColorClass: string
  isOpen: boolean
}

const AnimatedBar = ({
  insideChartText,
  outsideChartText,
  closedWidthClass,
  openWidthClass,
  chartColorClass,
  chartTextColorClass,
  isOpen,
}: AntimatedBarProps) => {
  const targetWidth = isOpen ? openWidthClass : closedWidthClass

  return (
    <div className="flex items-center">
      <div
        className={cn(
          `transition-width flex h-16 items-center justify-end overflow-hidden rounded-br rounded-tr pr-2 duration-1000`,
          targetWidth,
          chartColorClass,
          chartTextColorClass,
        )}
      >
        <div
          className={cn(
            'text-right font-medium leading-tight opacity-10 transition',
            isOpen
              ? 'opacity-100 delay-500 duration-300'
              : 'opacity-0 duration-200',
          )}
        >
          <div className="font-semibold">{outsideChartText}</div>
          <div className="text-sm">{insideChartText}</div>
        </div>
      </div>
    </div>
  )
}

export const WebsiteHomeFeatureValueForMoneyBarChart = () => {
  const [isChartOpen, setIsChartOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(ref, {
    threshold: 0,
    root: null,
    rootMargin: '-150px',
    freezeOnceVisible: true,
  })

  useEffect(() => {
    if (entry) {
      setIsChartOpen(entry.isIntersecting)
    }
  }, [entry])

  return (
    <div ref={ref} className="">
      <div className="border-l px-4 py-4 pl-8 md:px-0">
        <h3 className="mb-8 font-bold uppercase tracking-tighter">
          Chat AI cost per user and month
        </h3>
        <div className="space-y-8">
          {bars.map((bar, index) => (
            <AnimatedBar
              key={index}
              insideChartText={bar.insideChartText}
              outsideChartText={bar.outsideChartText}
              closedWidthClass="w-4"
              openWidthClass={bar.openWidthClass}
              chartColorClass={bar.colorClass}
              chartTextColorClass={bar.textClass}
              isOpen={isChartOpen}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
