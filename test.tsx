import * as React from 'react'
import * as ReactDOM from 'react-dom'

import RRIO from './index'

const rrio = RRIO()

class App extends React.Component {
  render() {
    return (
      <div>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'row'
          }}
        >
          <rrio.RemoteObserver>
            {event =>
              event.byY.map(entry => (
                <div
                  key={entry.name}
                  style={{
                    fontWeight: entry.isTopClosest ? 'bold' : 'normal',
                    padding: '1em'
                  }}
                  title={entry.boundingClientRect.top.toString()}
                >
                  {entry.name}
                </div>
              ))
            }
          </rrio.RemoteObserver>
        </div>
        <rrio.Section name="Section A">
          <div
            style={{
              width: '100vw',
              height: '400px',
              border: '3px dashed #ff0'
            }}
          />
        </rrio.Section>
        <rrio.Section name="Section B">
          <div
            style={{
              width: '100vw',
              height: '400px',
              border: '3px dashed #f0f'
            }}
          />
        </rrio.Section>
        <rrio.Section name="Section C">
          <div
            style={{
              width: '100vw',
              height: '400px',
              border: '3px dashed #0ff'
            }}
          />
        </rrio.Section>
        <rrio.Section name="Section D">
          <div
            style={{
              width: '100vw',
              height: '400px',
              border: '3px dashed #ff0'
            }}
          />
        </rrio.Section>
        <rrio.Section name="Section E">
          <div
            style={{
              width: '100vw',
              height: '400px',
              border: '3px dashed #f0f'
            }}
          />
        </rrio.Section>
        <rrio.Section name="Section F">
          <div
            style={{
              width: '100vw',
              height: '400px',
              border: '3px dashed #0ff'
            }}
          />
        </rrio.Section>
      </div>
    )
  }
}

window.onload = () => {
  const mount = document.createElement('div')
  document.body.appendChild(mount)
  ReactDOM.render(React.createElement(App), mount)
}
