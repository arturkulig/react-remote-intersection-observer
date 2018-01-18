import * as React from 'react'
import * as ReactDOM from 'react-dom'

interface SectionProps {
  name: string
  children: React.ReactElement<any>
}

interface RemoteObserverProps {
  children: (event: IntersectionEvent) => React.ReactNode
}

interface RemoteObserverState {
  event: IntersectionEvent
}

interface IntersectionInfo {
  name: string
  visibility: number
  top: number
  center: number
  bottom: number
  isTopClosest: boolean
  isCenterClosest: boolean
  isBottomClosest: boolean
  boundingClientRect: ClientRect
  target: Element
}

interface IntersectionEvent {
  byY: IntersectionInfo[]
  byCenter: IntersectionInfo[]
  byName: {
    [id: string]: IntersectionInfo
  }
}

export default function getComponents(opts: IntersectionObserverInit = {}) {
  let names: WeakMap<Element, string> = new WeakMap()

  const observers: RemoteObserver[] = []

  let lastEvent: {
    name: string
    visibility: number
    top: number
    center: number
    bottom: number
    target: Element
    boundingClientRect
  }[] = []
  let lastCustomEvent: IntersectionEvent = {
    byY: [],
    byCenter: [],
    byName: {}
  }

  const io =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          event => {
            const screenHeight = window.innerHeight
            const partialInfos = (lastEvent = lastEvent
              .filter(lastEntry => {
                for (const entry of event) {
                  if (lastEntry.target === entry.target) {
                    return false
                  }
                }
                return true
              })
              .map((entry, i) => {
                const boundingClientRect = entry.target.getBoundingClientRect()
                return {
                  name: entry.name,
                  target: entry.target,
                  visibility: entry.visibility,
                  top: boundingClientRect.top,
                  center:
                    boundingClientRect.top + boundingClientRect.height / 2,
                  bottom: boundingClientRect.top + boundingClientRect.height,
                  boundingClientRect
                }
              })
              .concat(
                event.map((entry, i) => {
                  const boundingClientRect = entry.boundingClientRect
                  return {
                    name: names.get(entry.target),
                    target: entry.target,
                    visibility: entry.intersectionRatio,
                    top: boundingClientRect.top,
                    center:
                      boundingClientRect.top + boundingClientRect.height / 2,
                    bottom: boundingClientRect.top + boundingClientRect.height,
                    boundingClientRect
                  }
                })
              ))
            const mins = partialInfos.reduce(
              (r, i) => ({
                top:
                  r.top.value > Math.abs(i.top)
                    ? { name: i.name, value: Math.abs(i.top) }
                    : r.top,
                center:
                  r.center.value > Math.abs(window.innerHeight / 2 - i.center)
                    ? {
                        name: i.name,
                        value: Math.abs(window.innerHeight / 2 - i.center)
                      }
                    : r.center,
                bottom:
                  r.bottom.value > Math.abs(window.innerHeight - i.bottom)
                    ? {
                        name: i.name,
                        value: Math.abs(window.innerHeight - i.bottom)
                      }
                    : r.bottom
              }),
              {
                top: { name: null, value: Number.POSITIVE_INFINITY },
                center: { name: null, value: Number.POSITIVE_INFINITY },
                bottom: { name: null, value: Number.POSITIVE_INFINITY }
              }
            )
            const infos = partialInfos.map(pInfo => ({
              ...pInfo,
              isTopClosest: pInfo.name === mins.top.name,
              isCenterClosest: pInfo.name === mins.center.name,
              isBottomClosest: pInfo.name === mins.bottom.name
            }))
            const uniqNamesInfosById = infos.reduce(
              (r, i) => ({ ...r, [i.name]: i }),
              {} as { [id: string]: IntersectionInfo }
            )
            const uniqNamesInfos = Object.keys(uniqNamesInfosById).map(
              key => uniqNamesInfosById[key]
            )

            observers.forEach(o => {
              o.setState({
                event: (lastCustomEvent = {
                  byY: [...uniqNamesInfos].sort(
                    (a, b) =>
                      a.boundingClientRect.top - b.boundingClientRect.top
                  ),
                  byCenter: [...uniqNamesInfos].sort(
                    (a, b) => a.center - b.center
                  ),
                  byName: uniqNamesInfosById
                })
              })
            })
          },
          { threshold: Array.from(new Array(10), (_, i) => i / 10), ...opts }
        )
      : null

  class Section extends React.Component<SectionProps> {
    element: Element = null

    componentWillUnmount() {
      if (!io) {
        return
      }
      io.unobserve(this.element)
      this.element = null
    }

    handleRootRef = ref => {
      this.observe(ReactDOM.findDOMNode(ref))
      this.props.children.props.ref && this.props.children.props.ref(ref)
    }

    observe(element: Element) {
      if (!io) {
        return
      }
      this.unobserve()

      if (!element) {
        return
      }

      this.element = element
      io.observe(this.element)
      names.set(element, this.props.name)
    }

    unobserve() {
      if (!io) {
        return
      }
      if (this.element === null) {
        return
      }
      io.unobserve(this.element)
      this.element = null
    }

    render() {
      return React.cloneElement(this.props.children, {
        ref: this.handleRootRef
      })
    }
  }

  class RemoteObserver extends React.Component<
    RemoteObserverProps,
    RemoteObserverState
  > {
    constructor(props) {
      super(props)
      this.state = {
        event: lastCustomEvent
      }
      observers.push(this)
    }

    componentWillUnmount() {
      observers.splice(observers.indexOf(this), 1)
    }

    render() {
      return this.props.children(this.state.event)
    }
  }

  return { Section, RemoteObserver }
}
