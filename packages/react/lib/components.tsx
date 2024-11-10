import React, {useMemo} from 'react'
import type {
  Accordion as WrAccordion,
  Box as WrBox,
  Button as WrButton,
  Checkbox as WrCheckbox,
  Collapsible as WrCollapsible,
  CollapsibleText as WrCollapsibleText,
  ConsoleLog as WrConsoleLog,
  Digits as WrDigits,
  Drawer as WrDrawer,
  // Dropdown,
  Header as WrHeader,
  Stack as WrStack,
  Input as WrInput,
  // Log,
  // ScrollableList,
  Scrollable as WrScrollable,
  Separator as WrSeparator,
  Slider as WrSlider,
  Space as WrSpace,
  Tree as WrTree,
  Tabs as WrTabs,
  ToggleGroup as WrToggleGroup,
  ViewProps,
} from '@wretched-tui/wretched'
import {TextProvider, TextStyle} from './components/TextReact'

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
  namespace JSX {
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

////
/// Views
//

export function Br(): JSX.Element {
  return <wr-br />
}
export function Checkbox(reactProps: CheckboxProps): JSX.Element {
  return <wr-checkbox {...reactProps} />
}
export function CollapsibleText(reactProps: CollapsibleTextProps): JSX.Element {
  return <wr-collapsible-text {...reactProps} />
}
export function ConsoleLog(reactProps: ConsoleProps): JSX.Element {
  return <wr-console {...reactProps} />
}
export function Digits(reactProps: DigitsProps): JSX.Element {
  return <wr-digits {...reactProps} />
}
export function H1(reactProps: HeaderProps): JSX.Element {
  return <wr-h1 {...reactProps} />
}
export function H2(reactProps: HeaderProps): JSX.Element {
  return <wr-h2 {...reactProps} />
}
export function H3(reactProps: HeaderProps): JSX.Element {
  return <wr-h3 {...reactProps} />
}
export function H4(reactProps: HeaderProps): JSX.Element {
  return <wr-h4 {...reactProps} />
}
export function H5(reactProps: HeaderProps): JSX.Element {
  return <wr-h5 {...reactProps} />
}
export function H6(reactProps: HeaderProps): JSX.Element {
  return <wr-h6 {...reactProps} />
}
export function Input(reactProps: InputProps): JSX.Element {
  return <wr-input {...reactProps} />
}

interface Separator {
  (reactProps: SeparatorProps): JSX.Element
  horizontal(reactProps: Omit<SeparatorProps, 'direction'>): JSX.Element
  vertical(reactProps: Omit<SeparatorProps, 'direction'>): JSX.Element
}
export const Separator: Separator = function Separator(
  reactProps: SeparatorProps,
): JSX.Element {
  return <wr-separator {...reactProps} />
}
Separator.horizontal = function SeparatorHorizontal(
  reactProps: Omit<SeparatorProps, 'direction'>,
) {
  return <wr-separator direction="horizontal" {...reactProps} />
}
Separator.vertical = function SeparatorHorizontal(
  reactProps: Omit<SeparatorProps, 'direction'>,
) {
  return <wr-separator direction="vertical" {...reactProps} />
}

interface Slider {
  (reactProps: SliderProps): JSX.Element
  horizontal(reactProps: Omit<SliderProps, 'direction'>): JSX.Element
  vertical(reactProps: Omit<SliderProps, 'direction'>): JSX.Element
}
export const Slider: Slider = function Slider(
  reactProps: SliderProps,
): JSX.Element {
  return <wr-slider {...reactProps} />
}
Slider.horizontal = function SliderHorizontal(
  reactProps: Omit<SliderProps, 'direction'>,
) {
  return <wr-slider direction="horizontal" {...reactProps} />
}
Slider.vertical = function SliderHorizontal(
  reactProps: Omit<SliderProps, 'direction'>,
) {
  return <wr-slider direction="vertical" {...reactProps} />
}

export function Space(reactProps: SpaceProps): JSX.Element {
  return <wr-space {...reactProps} />
}
export function ToggleGroup(reactProps: ToggleGroupProps): JSX.Element {
  return <wr-toggle-group {...reactProps} />
}

interface TreeProps<T> extends ViewProps {
  data: T[]
  render: (datum: T) => React.ReactNode
  getChildren?: (datum: T) => T[] | undefined
  title: React.ReactNode | string
}
export function Tree<T>(reactProps: TreeProps<T>): JSX.Element {
  const {title, ...props} = reactProps
  const titleView = useMemo(() => {
    if (typeof title === 'string') {
      return <wr-text>{title}</wr-text>
    }
    return title
  }, [title])
  return <wr-tree {...props}>{titleView}</wr-tree>
}

////
/// "Simple" containers
//

export function Box(reactProps: BoxProps): JSX.Element {
  const {children, ...props} = reactProps
  return <wr-box {...props}>{children}</wr-box>
}
export function Button(reactProps: ButtonProps): JSX.Element {
  const {children, ...props} = reactProps
  return <wr-button {...props}>{children}</wr-button>
}
export function Collapsible(reactProps: CollapsibleProps): JSX.Element {
  const {collapsed, expanded, ...props} = reactProps
  return (
    <wr-collapsible {...props}>
      {collapsed}
      {expanded}
    </wr-collapsible>
  )
}

interface Stack {
  (reactProps: StackProps): JSX.Element
  down(reactProps: Omit<StackProps, 'direction'>): JSX.Element
  up(reactProps: Omit<StackProps, 'direction'>): JSX.Element
  left(reactProps: Omit<StackProps, 'direction'>): JSX.Element
  right(reactProps: Omit<StackProps, 'direction'>): JSX.Element
}
export const Stack: Stack = function Stack(reactProps: StackProps) {
  const {children, ...props} = reactProps
  return <wr-stack {...props}>{children}</wr-stack>
}
Stack.down = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <wr-stack direction="down" {...props}>
      {children}
    </wr-stack>
  )
}
Stack.up = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <wr-stack direction="up" {...props}>
      {children}
    </wr-stack>
  )
}
Stack.right = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <wr-stack direction="right" {...props}>
      {children}
    </wr-stack>
  )
}
Stack.left = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <wr-stack direction="left" {...props}>
      {children}
    </wr-stack>
  )
}
export function Scrollable(reactProps: ScrollableProps): JSX.Element {
  const {children, ...props} = reactProps
  return <wr-scrollable {...props}>{children}</wr-scrollable>
}
/**
 * <Style /> is similar to <Text/> but only allows inline styles (bold, etc).
 * Does not support align or wrap (block styles). Does not support 'font', because
 * font is not encodable via SGR codes (and that's how I'm styling and
 * concatenating the text nodes).
 */
export function Style(reactProps: StyleProps): JSX.Element {
  return <wr-style {...reactProps} />
}
/**
 * <Text /> is a container that sets the text properties of child TextLiterals
 * (font, style) and TextContainers (wrap, alignment)
 */
export function Text(reactProps: TextProps): JSX.Element {
  return <wr-text {...reactProps} />
}

////
/// "Complex" containers
//

interface Accordion {
  (reactProps: AccordionProps): JSX.Element
  Section(reactProps: Omit<AccordionSectionProps, 'direction'>): JSX.Element
}
export const Accordion: Accordion = function Accordion(
  reactProps: AccordionProps,
): JSX.Element {
  const {children, ...props} = reactProps
  return <wr-accordion {...props}>{children}</wr-accordion>
}
Accordion.Section = function SliderHorizontal(
  reactProps: Omit<AccordionSectionProps, 'direction'>,
) {
  const {children, ...props} = reactProps
  return <wr-accordion-section {...props}>{children}</wr-accordion-section>
}

interface Drawer {
  (reactProps: DrawerProps): JSX.Element
  top(reactProps: Omit<DrawerProps, 'location'>): JSX.Element
  right(reactProps: Omit<DrawerProps, 'location'>): JSX.Element
  bottom(reactProps: Omit<DrawerProps, 'location'>): JSX.Element
  left(reactProps: Omit<DrawerProps, 'location'>): JSX.Element
}
export const Drawer: Drawer = function Drawer(
  reactProps: DrawerProps,
): JSX.Element {
  const {children, content, drawer, ...props} = reactProps
  return (
    <wr-drawer {...props}>
      {content}
      {drawer}
      {children}
    </wr-drawer>
  )
}
Drawer.top = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, content, drawer, ...props} = reactProps
  return (
    <wr-drawer location="top" {...props}>
      {content}
      {drawer}
      {children}
    </wr-drawer>
  )
}
Drawer.right = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, content, drawer, ...props} = reactProps
  return (
    <wr-drawer location="right" {...props}>
      {content}
      {drawer}
      {children}
    </wr-drawer>
  )
}
Drawer.bottom = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, ...props} = reactProps
  return (
    <wr-drawer location="bottom" {...props}>
      {children}
    </wr-drawer>
  )
}
Drawer.left = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, ...props} = reactProps
  return (
    <wr-drawer location="left" {...props}>
      {children}
    </wr-drawer>
  )
}

interface Tabs {
  (reactProps: TabsProps): JSX.Element
  Section(reactProps: Omit<TabsSectionProps, 'direction'>): JSX.Element
}
export const Tabs: Tabs = function Tabs(reactProps: TabsProps): JSX.Element {
  const {children, ...props} = reactProps
  return <wr-tabs {...props}>{children}</wr-tabs>
}
Tabs.Section = function SliderHorizontal(
  reactProps: Omit<TabsSectionProps, 'direction'>,
) {
  const {children, ...props} = reactProps
  return <wr-tabs-section {...props}>{children}</wr-tabs-section>
}
