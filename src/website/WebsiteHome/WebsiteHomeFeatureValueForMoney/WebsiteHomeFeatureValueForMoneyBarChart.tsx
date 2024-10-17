import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { useIntersectionObserver, useResizeObserver } from 'usehooks-ts'
// Data for our bars
const bars = [
  {
    outsideChartText: 'ChatGPT Enterprise',
    insideChartText: '$50/user/month',
    value: 50,
    colorClass: 'bg-zinc-300',
    textClass: ' text-zinc-900',
    openWidthClass: 'w-[942px]',
    openWidthClassMobile: 'w-[300px]',
  },
  {
    outsideChartText: 'ChatGPT Teams',
    insideChartText: '$30/user/month',
    value: 45,
    colorClass: 'bg-zinc-200',
    textClass: ' text-zinc-900',
    openWidthClass: 'w-[566px]',
    openWidthClassMobile: 'w-[181px]',
  },
  {
    outsideChartText: 'Llama Workspace',
    insideChartText: '$9/user/month',
    value: 9,
    colorClass: 'bg-gradient-to-r from-[#d162b5] to-[#5f6fd1]',
    textClass: ' text-white',
    openWidthClass: 'w-[170px]',
    openWidthClassMobile: 'w-[54px]',
    mobileDisplayTextOutside: true,
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
  mobileDisplayTextOutside?: boolean
}

const AnimatedBar = ({
  mobileDisplayTextOutside = false,
  insideChartText,
  outsideChartText,
  closedWidthClass,
  openWidthClass,
  chartColorClass,
  chartTextColorClass,
  isOpen,
}: AntimatedBarProps) => {
  const targetWidth = isOpen ? openWidthClass : closedWidthClass
  const innerEl = (
    <div
      className={cn(
        'font-medium leading-tight opacity-10 transition',
        !mobileDisplayTextOutside && 'text-right',
        isOpen
          ? 'opacity-100 delay-500 duration-300'
          : 'opacity-0 duration-200',
      )}
    >
      <div className="font-semibold">{outsideChartText}</div>
      <div className="text-sm">{insideChartText}</div>
    </div>
  )
  return (
    <div className="flex h-20 items-center gap-x-2 overflow-hidden">
      <div
        className={cn(
          `transition-width flex h-20 items-center  overflow-hidden rounded pr-2 duration-1000`,
          !mobileDisplayTextOutside && 'justify-end',
          targetWidth,
          chartColorClass,
          chartTextColorClass,
        )}
      >
        {!mobileDisplayTextOutside && innerEl}
      </div>
      {mobileDisplayTextOutside && <div>{innerEl}</div>}
    </div>
  )
}

export const WebsiteHomeFeatureValueForMoneyBarChart = () => {
  const [isChartOpen, setIsChartOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const { width } = useResizeObserver({ ref })

  const renderForMobile = (width ?? 0) < 450

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
    <div ref={ref} className="space-y-4">
      {bars.map((bar, index) => (
        <AnimatedBar
          key={index}
          insideChartText={bar.insideChartText}
          outsideChartText={bar.outsideChartText}
          closedWidthClass="w-4"
          openWidthClass={
            renderForMobile ? bar.openWidthClassMobile : bar.openWidthClass
          }
          chartColorClass={bar.colorClass}
          chartTextColorClass={bar.textClass}
          isOpen={isChartOpen}
          mobileDisplayTextOutside={bar.mobileDisplayTextOutside}
        />
      ))}
    </div>
  )
}
