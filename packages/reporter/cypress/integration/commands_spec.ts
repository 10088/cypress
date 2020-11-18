/// <reference types="../support" />

import { EventEmitter } from 'events'
import Runnable from '../../src/runnables/runnable-model'
import { addCommand } from '../support/utils'

describe('commands', () => {
  let runner: EventEmitter
  let runnables: Runnable[]

  beforeEach(() => {
    cy.fixture('runnables_commands').then((_runnables) => {
      runnables = _runnables
    })

    runner = new EventEmitter()

    cy.visit('dist').then((win) => {
      return win.render({
        runner,
        spec: {
          name: 'foo',
          absolute: '/foo/bar',
          relative: 'foo/bar',
        },
      })
    })

    cy.get('.reporter').then(() => {
      runner.emit('runnables:ready', runnables)
      runner.emit('reporter:start', {})
      addCommand(runner, {
        id: '69',
        name: 'get',
        message: '#in-progress',
        state: 'pending',
        timeout: 4000,
        wallClockStartedAt: (new Date()).toISOString(),
      })
    })

    cy.contains('http://localhost:3000') // ensure test content has loaded
  })

  it('includes the type class', () => {
    cy.contains('#exists').closest('.command')
    .should('have.class', 'command-type-parent')

    cy.contains('#doesnt-exist').closest('.command')
    .should('have.class', 'command-type-child')
  })

  it('includes the name class', () => {
    cy.contains('#exists').closest('.command')
    .should('have.class', 'command-name-get')
  })

  it('includes the state class', () => {
    cy.contains('#exists').closest('.command')
    .should('have.class', 'command-state-passed')

    cy.contains('#doesnt-exist').closest('.command')
    .should('have.class', 'command-state-failed')

    cy.contains('#in-progress').closest('.command')
    .should('have.class', 'command-state-pending')
  })

  it('displays the number', () => {
    cy.contains('http://localhost:3000').closest('.command-message').siblings('.command-number')
    .should('have.text', '1')

    cy.contains('#exists').closest('.command-message').siblings('.command-number')
    .should('have.text', '2')

    cy.contains('#doesnt-exist').closest('.command-message').siblings('.command-number')
    .should('have.text', '3')

    cy.contains('.some-els').closest('.command-message').siblings('.command-number')
    .should('have.text', '4')
  })

  it('events have is-event class, no number, and type in parentheses', () => {
    cy.contains('GET ---').closest('.command')
    .should('have.class', 'command-is-event')

    cy.contains('GET ---').closest('.command-message').siblings('.command-number')
    .should('have.text', '')

    cy.contains('GET ---').closest('.command-message').siblings('.command-method')
    .should('have.text', '(xhr stub)')
  })

  it('includes the scaled class when the message is over 100 chars', () => {
    cy.contains('Lorem ipsum').closest('.command')
    .should('have.class', 'command-scaled')
  })

  it('does not render with the scaled class when the message is less than 100 chars', () => {
    cy.contains('#exists').closest('.command')
    .should('not.have.class', 'command-scaled')
  })

  it('renders markdown in message', () => {
    cy.contains('Lorem ipsum').closest('.command').find('.command-message').within(() => {
      cy.get('strong').should('have.text', 'dolor')
      cy.get('em').should('have.text', 'sit')
    })
  })

  it('shows indicator when specified', () => {
    cy.contains('GET ---').closest('.command').find('.command-message .fa-circle')
    .should('be.visible')
  })

  it('includes the renderProps indicator as a class name when specified', () => {
    cy.contains('Lorem ipsum').closest('.command').find('.command-message .fa-circle')
    .should('have.class', 'bad')
  })

  it('displays a progress indicator', () => {
    cy.contains('#in-progress').closest('.command').find('.command-progress span').invoke('attr', 'style')
    .should('match', /animation-duration: \d+ms; transform: scaleX\(0\.\d+\);/)
  })

  context('invisible indicator', () => {
    it('does not display invisible icon when visible', () => {
      cy.contains('#exists').closest('.command').find('.command-invisible')
      .should('not.be.visible')
    })

    it('displays invisible icon when not visible', () => {
      cy.contains('#doesnt-exist').closest('.command').find('.command-invisible')
      .should('be.visible')
    })

    it('displays a tooltip when hovering', () => {
      cy.contains('#doesnt-exist').closest('.command').find('.command-invisible').trigger('mouseover')
      cy.get('.cy-tooltip')
      .should('be.visible')
      .should('have.text', 'This element is not visible.')
    })

    it('displays different text when multiple elements', () => {
      cy.contains('.invisible').closest('.command').find('.command-invisible').trigger('mouseover')
      cy.get('.cy-tooltip')
      .should('be.visible')
      .should('have.text', 'One or more matched elements are not visible.')
    })
  })

  context('elements indicator', () => {
    it('shows number of elements when 0 or greater than 1', () => {
      cy.contains('#doesnt-exist').closest('.command').find('.num-elements')
      .should('be.visible').and('have.text', '0')

      cy.contains('.some-els').closest('.command').find('.num-elements')
      .should('be.visible').and('have.text', '4')
    })

    it('does not show number of elements when 0', () => {
      cy.contains('#exists').closest('.command').find('.num-elements')
      .should('not.be.visible')
    })

    it('renders a tooltip when hovering', () => {
      cy.contains('.some-els').closest('.command').find('.num-elements').trigger('mouseover')
      cy.get('.cy-tooltip').should('be.visible').should('have.text', '4 matched elements')
    })
  })

  context('duplicates', () => {
    it('collapses consecutive duplicate events into one', () => {
      cy.get('.command-name-xhr').should('have.length', 3)
    })

    it('displays number of duplicates', () => {
      cy.contains('GET --- /dup').closest('.command').find('.num-duplicates')
      .should('have.text', '4')
    })

    it('expands all events after clicking arrow', () => {
      cy.contains('GET --- /dup').closest('.command').find('.command-expander').click()
      cy.get('.command-name-xhr').should('have.length', 6)
      cy.contains('GET --- /dup').closest('.command').find('.duplicates')
      .should('be.visible')
      .find('.command').should('have.length', 3)
    })
  })

  context('clicking', () => {
    it('pins the command', () => {
      cy.contains('#exists').click()
      .closest('.command')
      .should('have.class', 'command-is-pinned')
    })

    it('shows a tooltip', () => {
      cy.contains('#exists').click()
      cy.get('.cy-tooltip').should('have.text', 'Printed output to your console')
    })

    it('emits runner:console:log', () => {
      cy.spy(runner, 'emit')
      cy.contains('#exists').click()
      cy.wrap(runner.emit).should('be.calledWith', 'runner:console:log', 'c2')
    })

    it('shows the snapshot', () => {
      cy.spy(runner, 'emit')
      cy.contains('#exists').click()
      cy.wrap(runner.emit).should('be.calledWith', 'runner:show:snapshot', 'c2')
    })

    it('unpins after clicking again, does not emit runner:console:log again', () => {
      cy.spy(runner, 'emit')
      cy.contains('#exists').click()
      cy.contains('#exists').click()
      // @ts-ignore
      cy.wrap(runner.emit.withArgs('runner:console:log')).should('be.calledOnce')
    })

    it('unpins after clicking another command, pins that one', () => {
      cy.spy(runner, 'emit')
      cy.contains('#exists').click()
      cy.contains('#doesnt-exist').click()
      cy.contains('#exists').closest('.command')
      .should('not.have.class', 'command-is-pinned')

      cy.contains('#doesnt-exist').closest('.command')
      .should('have.class', 'command-is-pinned')
    })
  })

  context('mousing over', () => {
    beforeEach(() => {
      cy.spy(runner, 'emit')
      cy.clock()
      cy.get('.command').first().trigger('mouseover')
    })

    it('shows snapshot after 50ms passes', () => {
      cy.wrap(runner.emit).should('not.be.calledWith', 'runner:show:snapshot')
      cy.tick(50)
      cy.wrap(runner.emit).should('be.calledWith', 'runner:show:snapshot', 'c1')
    })

    describe('then mousing out', () => {
      beforeEach(() => {
        cy.tick(50)
        cy.get('.command').first().trigger('mouseout')
      })

      it('hides the snapshot after 50ms pass without another mouse over', () => {
        cy.tick(50)
        cy.wrap(runner.emit).should('be.calledWith', 'runner:hide:snapshot', 'c1')
      })

      it('does not hide the snapshot if there is another mouseover before 50ms passes', () => {
        cy.wrap(runner.emit).should('not.be.calledWith', 'runner:hide:snapshot')
      })
    })
  })
})
