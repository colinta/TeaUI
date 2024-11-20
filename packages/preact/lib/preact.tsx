import React from 'react'
import {h, Fragment, render} from 'preact'
import {
  Accordion as WrAccordion,
  Box as WrBox,
  Button as WrButton,
  Checkbox as WrCheckbox,
  Collapsible as WrCollapsible,
  CollapsibleText as WrCollapsibleText,
  ConsoleLog as WrConsoleLog,
  Container,
  Digits as WrDigits,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Drawer as WrDrawer,
  ToggleGroup as WrToggleGroup,
  Input as WrInput,
  Screen,
  Scrollable as WrScrollable,
  Separator as WrSeparator,
  Slider as WrSlider,
  Space as WrSpace,
  Stack as WrStack,
  Tabs as WrTabs,
  View,
  ViewProps,
  Window as WrWindow,
} from '@teaui/core'
import {
  TextContainer,
  TextLiteral,
  TextProvider,
  TextStyle,
} from './components/TextReact'
import type {
  CheckboxProps,
  CollapsibleTextProps,
  ConsoleProps,
  DigitsProps,
  HeaderProps,
  InputProps,
  SeparatorProps,
  SliderProps,
  SpaceProps,
  ToggleGroupProps,
  BoxProps,
  ButtonProps,
  CollapsibleProps,
  ScrollableProps,
  StackProps,
  StyleProps,
  TextProps,
  AccordionProps,
  AccordionSectionProps,
  DrawerProps,
  TabsProps,
  TabsSectionProps,
} from './components'

declare module 'react' {
  namespace preact.JSX {
    interface IntrinsicElements {
      // views
      'tui-br': {}
      'tui-checkbox': CheckboxProps
      'tui-collapsible-text': CollapsibleTextProps
      'tui-console': ConsoleProps
      'tui-digits': DigitsProps
      'tui-h1': HeaderProps
      'tui-h2': HeaderProps
      'tui-h3': HeaderProps
      'tui-h4': HeaderProps
      'tui-h5': HeaderProps
      'tui-h6': HeaderProps
      'tui-input': InputProps
      'tui-separator': SeparatorProps
      'tui-slider': SliderProps
      'tui-space': SpaceProps
      'tui-toggle-group': ToggleGroupProps

      'tui-tree': ViewProps

      // "simple" containers
      'tui-box': BoxProps
      'tui-button': ButtonProps
      'tui-collapsible': CollapsibleProps

      'tui-scrollable': ScrollableProps
      'tui-stack': StackProps
      'tui-style': StyleProps
      'tui-text': TextProps

      // "complex" containers
      'tui-accordion': AccordionProps
      'tui-accordion-section': AccordionSectionProps
      'tui-drawer': DrawerProps

      'tui-tabs': TabsProps
      'tui-tabs-section': TabsSectionProps
    }
  }
}

function createView(type: string, props: Props): any {
  switch (type) {
    case 'text':
      return new TextLiteral(String(props.text) ?? '')
    case 'br':
    case 'tui-br':
      return new TextLiteral('\n')
    case 'checkbox':
    case 'tui-checkbox':
      return new WrCheckbox(props as any)
    case 'collapsible-text':
    case 'tui-collapsible-text':
      return new WrCollapsibleText(props as any)
    case 'console':
    case 'tui-console':
      return new WrConsoleLog(props as any)
    case 'digits':
    case 'tui-digits':
      return new WrDigits(props as any)
    case 'h1':
    case 'tui-h1':
      return H1(((props as any).text as string) ?? '')
    case 'h2':
    case 'tui-h2':
      return H2(((props as any).text as string) ?? '')
    case 'h3':
    case 'tui-h3':
      return H3(((props as any).text as string) ?? '')
    case 'h4':
    case 'tui-h4':
      return H4(((props as any).text as string) ?? '')
    case 'h5':
    case 'tui-h5':
      return H5(((props as any).text as string) ?? '')
    case 'h6':
    case 'tui-h6':
      return H6(((props as any).text as string) ?? '')
    case 'toggle-group':
    case 'tui-toggle-group':
      return new WrToggleGroup(props as any)
    case 'input':
    case 'tui-input':
      return new WrInput(props as any)
    case 'literal':
    case 'tui-literal':
      return new TextLiteral(props.text ?? '')
    case 'separator':
    case 'tui-separator':
      return new WrSeparator(props as any)
    case 'slider':
    case 'tui-slider':
      return new WrSlider(props as any)
    case 'space':
    case 'tui-space':
      return new WrSpace(props as any)
    // case 'Tree':
    //   return
    case 'box':
    case 'tui-box':
      return new WrBox(props as any)
    case 'button':
    case 'tui-button':
      return new WrButton(props as any)
    case 'collapsible':
    case 'tui-collapsible':
      return new WrCollapsible(props as any)
    case 'scrollable':
    case 'tui-scrollable':
      return new WrScrollable(props as any)
    case 'stack':
    case 'tui-stack':
      return new WrStack(props as any)
    case 'style':
    case 'tui-style':
      return new TextStyle(props as any)
    case 'tui-text':
      return new TextProvider(props as any)
    case 'accordion':
    case 'tui-accordion':
      return new WrAccordion(props as any)
    case 'accordion-section':
    case 'tui-accordion-section':
      return new WrAccordion.Section(props as any)
    case 'drawer':
    case 'tui-drawer':
      return new WrDrawer(props as any)
    case 'tabs':
    case 'tui-tabs':
      return new WrTabs(props as any)
    case 'tabs-section':
    case 'tui-tabs-section':
      return new WrTabs.Section(props as any)
    case 'window':
    case 'tui-window':
      return new WrWindow(props)
    default:
      throw Error(`Unknown type ${type}`)
  }
}

type Props = Record<string, any>

interface Renderer<Node> {
  create(type: string, props: Props): Node
  insert(parent: Node, node: Node, before?: Node): void
  update(node: Node, props: Props): void
  remove(parent: Node, node: Node): void
}

const defer = Promise.prototype.then.bind(Promise.resolve())

function removeFromTextContainer(container: Container, child: View) {
  // find TextContainer with child in it, and remove
  for (const node of container.children) {
    if (node instanceof TextContainer && node.children.includes(child)) {
      node.removeChild(child)
      if (node.children.length === 0) {
        container.removeChild(node)
      }
      return
    }
  }
}

function removeChild(container: Container, child: View) {
  if (child.parent === container) {
    container.removeChild(child)
  } else if (child instanceof TextLiteral || child instanceof TextStyle) {
    removeFromTextContainer(container, child)
  }
}

function appendChild(parentInstance: Container, child: View, before?: View) {
  if (
    parentInstance instanceof TextStyle &&
    (child instanceof TextLiteral || child instanceof TextStyle)
  ) {
    // do not do the TextContainer song and dance
  } else if (child instanceof TextLiteral || child instanceof TextStyle) {
    // find the last child (checking 'before')
    let lastChild: View | undefined = parentInstance.children.at(-1)
    if (before) {
      const index = parentInstance.children.indexOf(before)
      if (~index) {
        lastChild = parentInstance.children.at(index - 1)
      }
    }

    let textContainer: TextContainer
    if (lastChild instanceof TextContainer) {
      textContainer = lastChild
    } else {
      textContainer = new TextContainer()
      parentInstance.add(textContainer)
    }

    textContainer.add(child)
    return
  }

  let index: number | undefined = before
    ? parentInstance.children.indexOf(before)
    : -1
  if (index === -1) {
    index = undefined
  }

  parentInstance.add(child, index)
}

class RendererElement<T> {
  parentNode: RendererElement<T> | null = null
  nextSibling: RendererElement<T> | null = null
  previousSibling: RendererElement<T> | null = null
  firstChild: RendererElement<T> | null = null
  lastChild: RendererElement<T> | null = null
  props: Props = {}
  prevProps?: Props
  node?: any
  nodeType = ''

  constructor(
    private renderer: Renderer<T>,
    public localName: string,
  ) {
    this._commit = this._commit.bind(this)
  }
  set data(text: any) {
    this.setAttribute('text', String(text))
  }
  addEventListener(event: any, func: any) {
    this.setAttribute(`on${event}`, (...args: any[]) =>
      (this as any).l[event + false](...args),
    )
  }
  setAttribute(name: string, value: any) {
    if (this.node && !this.prevProps) {
      this.prevProps = Object.assign({}, this.props)
      defer(this._commit)
    }
    this.props[name] = value
  }
  removeAttribute(name: string) {
    delete this.props[name]
  }
  _attach() {
    return (this.node ||= this.renderer.create(this.localName, this.props))
  }
  _commit() {
    const state = this.node
    const prev = this.prevProps
    if (!state || !prev) return
    this.prevProps = undefined
    this.renderer.update(state, this.props)
  }
  insertBefore(child: RendererElement<T>, before?: RendererElement<T> | null) {
    if (child.parentNode === this) this.removeChild(child)

    if (before) {
      const prev = before.previousSibling
      child.previousSibling = prev
      before.previousSibling = child
      if (prev) {
        prev.nextSibling = child
      }
      if (before == this.firstChild) {
        this.firstChild = child
      }
    } else {
      const last = this.lastChild
      child.previousSibling = last
      this.lastChild = child
      if (last) last.nextSibling = child
      if (!this.firstChild) this.firstChild = child
    }

    child.parentNode = this
    child.nextSibling = before ?? null

    this.renderer.insert(
      this._attach(),
      child._attach(),
      before && before._attach(),
    )
  }
  appendChild(child: RendererElement<T>) {
    this.insertBefore(child)
  }
  removeChild(child: RendererElement<T>) {
    if (this.firstChild === child) this.firstChild = child.nextSibling
    if (this.lastChild === child) this.lastChild = child.previousSibling
    child.parentNode = child.nextSibling = child.previousSibling = null
    if (this.node && child.node) {
      this.renderer.remove(this.node, child.node)
    }
  }
}

function createRendererDom<T>(renderer: Renderer<T>) {
  function createElement(type: string) {
    return new RendererElement(renderer, type)
  }

  function createElementNS(_: unknown, type: string) {
    return new RendererElement(renderer, type)
  }

  function createTextNode(text: any) {
    const node = createElement('text')
    node.props.text = String(text)
    return node
  }

  function createRoot() {
    return createElement('tui-window')
  }

  return {createElement, createElementNS, createTextNode, createRoot}
}

const dom = createRendererDom<View>({
  create(type, props) {
    return createView(type, props)
  },
  insert(parent, node, before) {
    if (!(parent instanceof Container)) {
      return
    }
    appendChild(parent, node, before)
  },
  remove(parent, node) {
    if (!(parent instanceof Container)) {
      return
    }
    removeChild(parent, node)
  },
  update(node, props) {
    if (node instanceof TextLiteral) {
      node.update(props)
      node.text = props.text ?? ''
    } else {
      node.update(props)
    }
  },
})

Object.assign(global, {document: {}})
Object.assign(document, dom)

export async function run(component: React.ReactNode) {
  const root = dom.createRoot()

  render(component, root as any)
  const window = root.node
  const start = await Screen.start(window)
  const [screen, _] = start
}
