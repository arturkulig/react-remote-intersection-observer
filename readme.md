# react-remote-intersection-observer

Using this library you can measure visibility of some element and react to visibility change in some other place. Clone this repository and `npm start` dev server to see it in action.

## Simple usage

```tsx
import * as React from 'react'
import rrio from 'react-remote-intersection-observer'
const {
  // this is where IntersectionObserver is going to be mounted
  Section,

  // this is what will change in response to some Section element visibility change
  RemoteObserver
} = rrio()

class App extends React.Component {
    render() {
        return (
            <div>
                <RemoteObserver>
                    {entries =>
                        entries.map(
                            entry => (
                                <span>
                                    {entry.name}
                                    is visible in
                                    {entry.visibility * 100}%
                                </span>
                            )
                        )
                    }
                </RemoteObserver>
                <Section name="victim">
                  <div id="victim">
                </Section>
            </div>
        )
    }
}
```

## RemoteObserver

`RemoteObserver` render function prop provides event object of interface:

```tsx
interface IntersectionEvent {
  byY: IntersectionInfo[]
  byCenter: IntersectionInfo[]
  byName: {
    [id: string]: IntersectionInfo
  }
}

interface IntersectionInfo {
  // for identifying element, same as Section[name]
  name: string

  // number in range of 0-1 where 0 is invisible 1 is completely in viewport
  visibility: number

  // handy shortcuts to element-screen relation
  top: number
  center: number
  bottom: number

  // handy for quick lookups of most in focus element
  isTopClosest: boolean
  isCenterClosest: boolean
  isBottomClosest: boolean

  // for more advanced cases / integration purposes
  boundingClientRect: ClientRect
  target: Element
}>
```

`event.byY` is list sorted by how far from page top are elements top edges.

`event.byCenter` is list sorted by how far from page top each element center is.

`event.byName` is collection of all actively observed elements infos with elements names as keys.
