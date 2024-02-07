import { cn } from '@/lib/utils'
import React from 'react'
import ContentEditable, {
  type ContentEditableEvent,
} from 'react-contenteditable'
import sanitizeHtml from 'sanitize-html'

interface ContentEditableProps {
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  tagName?: string
  className?: string
  initialValue?: string | null
  disabled?: boolean
  focusOnMount?: boolean
}

interface ContentEditableState {
  html: string
  initialValue?: string | null
  colonCounter: number
}

const sanitizeConfig = {
  allowedTags: [],
  allowedAttributes: {},
}

export class Editable extends React.Component<ContentEditableProps> {
  public contentEditable: React.RefObject<HTMLElement>
  public state: ContentEditableState

  static getDerivedStateFromProps(
    props: ContentEditableProps,
    state: ContentEditableState,
  ) {
    if (props.initialValue != state.initialValue) {
      return {
        ...state,
        initialValue: props.initialValue,
        html: sanitizeHtml(props.initialValue ?? '', sanitizeConfig),
      }
    }
    return null
  }

  constructor(props: ContentEditableProps) {
    super(props)
    this.contentEditable = React.createRef()
    this.state = {
      html: sanitizeHtml(props.initialValue ?? '', sanitizeConfig),
      initialValue: props.initialValue,
      colonCounter: 0,
    }
  }

  componentDidMount(): void {
    if (!this.props.focusOnMount) {
      return
    }
    // If the initial value is empty, focus the contentEditable
    const ref = this.contentEditable.current
    const length = this.state.html.length

    if (!this.contentEditable.current) {
      return
    }
    this.contentEditable.current.focus()

    const range = document.createRange()
    const selection = window.getSelection()
    if (!selection) {
      return
    }
    range.setStart(
      this.contentEditable.current,
      this.contentEditable.current.childNodes.length,
    )
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault()

    // Get the plain text from the clipboard
    const text = event.clipboardData.getData('text/plain')
    this.setState({
      html: sanitizeHtml(text ?? '', sanitizeConfig),
    })
  }

  handleChange = (evt: ContentEditableEvent) => {
    const html = evt.target.value
    this.setState({ html })
    this.props.onChange(sanitizeHtml(html, sanitizeConfig))
  }

  handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.contentEditable.current?.blur()
    }
  }

  render = () => {
    const tagName = this.props.tagName ?? 'div'
    const baseClassnames = 'cursor-text outline-none line-clamp-1 pr-1 w-full'

    let className = cn(baseClassnames, this.props.className)
    if (this.state.html === '') {
      className = cn(className, 'text-zinc-400')
    }

    return (
      <>
        <ContentEditable
          innerRef={this.contentEditable}
          html={this.state.html} // innerHTML of the editable div
          disabled={!!this.props.disabled} // use true to disable editing
          onChange={this.handleChange} // handle innerHTML change
          onBlur={this.props.onBlur}
          onKeyDown={this.handleKeyDown}
          onPaste={this.handlePaste}
          tagName={tagName} // Use a custom HTML tag (uses a div by default)
          className={className}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          placeholder={this.props.placeholder}
          suppressContentEditableWarning={true}
        />
      </>
    )
  }
}
