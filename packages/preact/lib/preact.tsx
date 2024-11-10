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
} from '@wretched-tui/wretched'
import {
  TextContainer,
  TextLiteral,
  TextProvider,
  TextStyle,
} from './components/TextReact'

type Children = 'children' | 'child'
type WretchedView<
  T extends abstract new (arg: any, ...args: any) => any,
  OmitProps extends keyof ConstructorParameters<T>[0] = Children,
> = Omit<NonNullable<ConstructorParameters<T>[0]>, OmitProps>

type WretchedContainer<
  T extends abstract new (arg: any, ...args: any) => any,
  ChildrenProps extends keyof NonNullable<
    ConstructorParameters<T>[0]
  > = Children,
> = WretchedView<T, ChildrenProps> & {[Key in ChildrenProps]?: React.ReactNode}

type CheckboxProps = WretchedView<typeof WrCheckbox>
type CollapsibleTextProps = WretchedView<typeof WrCollapsibleText>
type ConsoleProps = WretchedView<typeof WrConsoleLog>
type DigitsProps = WretchedView<typeof WrDigits>
type HeaderProps = {text?: string}
type InputProps = WretchedView<typeof WrInput>
type SeparatorProps = WretchedView<typeof WrSeparator>
type SliderProps = WretchedView<typeof WrSlider>
type SpaceProps = WretchedView<typeof WrSpace>
type ToggleGroupProps = WretchedView<typeof WrToggleGroup>

// "simple" containers
type BoxProps = WretchedContainer<typeof WrBox>
type ButtonProps = WretchedContainer<typeof WrButton>
type CollapsibleProps = WretchedContainer<
  typeof WrCollapsible,
  'collapsed' | 'expanded' | 'children'
>
type ScrollableProps = WretchedContainer<typeof WrScrollable>
type StackProps = WretchedContainer<typeof WrStack>
type StyleProps = WretchedContainer<typeof TextStyle>
type TextProps = WretchedContainer<typeof TextProvider>

// "complex" containers
type AccordionProps = WretchedContainer<typeof WrAccordion>
type AccordionSectionProps = WretchedContainer<typeof WrAccordion.Section>
type DrawerProps = WretchedContainer<
  typeof WrDrawer,
  'content' | 'drawer' | 'children'
>
type TabsProps = WretchedContainer<typeof WrTabs>
type TabsSectionProps = WretchedContainer<typeof WrTabs.Section>

declare module 'react' {
  namespace preact.JSX {
    interface IntrinsicElements {
      // views
      'wr-br': {}
      'wr-checkbox': CheckboxProps
      'wr-collapsible-text': CollapsibleTextProps
      'wr-console': ConsoleProps
      'wr-digits': DigitsProps
      'wr-h1': HeaderProps
      'wr-h2': HeaderProps
      'wr-h3': HeaderProps
      'wr-h4': HeaderProps
      'wr-h5': HeaderProps
      'wr-h6': HeaderProps
      'wr-input': InputProps
      'wr-separator': SeparatorProps
      'wr-slider': SliderProps
      'wr-space': SpaceProps
      'wr-toggle-group': ToggleGroupProps

      'wr-tree': ViewProps

      // "simple" containers
      'wr-box': BoxProps
      'wr-button': ButtonProps
      'wr-collapsible': CollapsibleProps

      'wr-scrollable': ScrollableProps
      'wr-stack': StackProps
      'wr-style': StyleProps
      'wr-text': TextProps

      // "complex" containers
      'wr-accordion': AccordionProps
      'wr-accordion-section': AccordionSectionProps
      'wr-drawer': DrawerProps

      'wr-tabs': TabsProps
      'wr-tabs-section': TabsSectionProps
    }
  }
}

function createView(type: string, props: Props): any {
  switch (type) {
    case 'text':
      return new TextLiteral(String(props.text) ?? '')
    case 'br':
    case 'wr-br':
      return new TextLiteral('\n')
    case 'wr-checkbox':
      return new WrCheckbox(props as any)
    case 'wr-collapsible-text':
      return new WrCollapsibleText(props as any)
    case 'wr-console':
      return new WrConsoleLog(props as any)
    case 'wr-digits':
      return new WrDigits(props as any)
    case 'wr-h1':
      return H1(((props as any).text as string) ?? '')
    case 'wr-h2':
      return H2(((props as any).text as string) ?? '')
    case 'wr-h3':
      return H3(((props as any).text as string) ?? '')
    case 'wr-h4':
      return H4(((props as any).text as string) ?? '')
    case 'wr-h5':
      return H5(((props as any).text as string) ?? '')
    case 'wr-h6':
      return H6(((props as any).text as string) ?? '')
    case 'wr-toggle-group':
      return new WrToggleGroup(props as any)
    case 'wr-input':
      return new WrInput(props as any)
    case 'wr-literal':
      return new TextLiteral(props.text ?? '')
    case 'wr-separator':
      return new WrSeparator(props as any)
    case 'wr-slider':
      return new WrSlider(props as any)
    case 'wr-space':
      return new WrSpace(props as any)
    // case 'Tree':
    //   return
    case 'wr-box':
      return new WrBox(props as any)
    case 'wr-button':
      return new WrButton(props as any)
    case 'wr-collapsible':
      return new WrCollapsible(props as any)
    case 'wr-scrollable':
      return new WrScrollable(props as any)
    case 'wr-stack':
      return new WrStack(props as any)
    case 'wr-style':
      return new TextStyle(props as any)
    case 'wr-text':
      return new TextProvider(props as any)
    case 'wr-accordion':
      return new WrAccordion(props as any)
    case 'wr-accordion-section':
      return new WrAccordion.Section(props as any)
    case 'wr-drawer':
      return new WrDrawer(props as any)
    case 'wr-tabs':
      return new WrTabs(props as any)
    case 'wr-tabs-section':
      return new WrTabs.Section(props as any)
    case 'wr-window':
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
    // if last child of parentInstance is TextContainer, use it, otherwise create new one
    const lastChild = parentInstance.children.at(-1)
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
    return createElement('wr-window')
  }

  return {createElement, createElementNS, createTextNode, createRoot}
}

const dom = createRendererDom({
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
