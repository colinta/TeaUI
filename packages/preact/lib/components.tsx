import React from 'react'
import {useMemo} from 'preact/hooks'
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
} from '@teaui/core'
import {TextProvider, TextStyle} from './components/TextReact'

type Children = 'children' | 'child'
type TUIView<
  T extends abstract new (arg: any, ...args: any) => any,
  OmitProps extends keyof ConstructorParameters<T>[0] = Children,
> = Omit<NonNullable<ConstructorParameters<T>[0]>, OmitProps>

type TUIContainer<
  T extends abstract new (arg: any, ...args: any) => any,
  ChildrenProps extends keyof NonNullable<
    ConstructorParameters<T>[0]
  > = Children,
> = TUIView<T, ChildrenProps> & {[Key in ChildrenProps]?: React.ReactNode}

export type CheckboxProps = TUIView<typeof WrCheckbox>
export type CollapsibleTextProps = TUIView<typeof WrCollapsibleText>
export type ConsoleProps = TUIView<typeof WrConsoleLog>
export type DigitsProps = TUIView<typeof WrDigits>
export type HeaderProps = {text?: string}
export type InputProps = TUIView<typeof WrInput>
export type SeparatorProps = TUIView<typeof WrSeparator>
export type SliderProps = TUIView<typeof WrSlider>
export type SpaceProps = TUIView<typeof WrSpace>
export type ToggleGroupProps = TUIView<typeof WrToggleGroup>

// "simple" containers
export type BoxProps = TUIContainer<typeof WrBox>
export type ButtonProps = TUIContainer<typeof WrButton>
export type CollapsibleProps = TUIContainer<
  typeof WrCollapsible,
  'collapsed' | 'expanded' | 'children'
>
export type ScrollableProps = TUIContainer<typeof WrScrollable>
export type StackProps = TUIContainer<typeof WrStack>
export type StyleProps = TUIContainer<typeof TextStyle>
export type TextProps = TUIContainer<typeof TextProvider>

// "complex" containers
export type AccordionProps = TUIContainer<typeof WrAccordion>
export type AccordionSectionProps = TUIContainer<typeof WrAccordion.Section>
export type DrawerProps = TUIContainer<
  typeof WrDrawer,
  'content' | 'drawer' | 'children'
>
export type TabsProps = TUIContainer<typeof WrTabs>
export type TabsSectionProps = TUIContainer<typeof WrTabs.Section>

declare module 'react' {
  namespace JSX {
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

////
/// Views
//

export function Br(): preact.JSX.Element {
  return <tui-br />
}
export function Checkbox(reactProps: CheckboxProps): preact.JSX.Element {
  return <tui-checkbox {...reactProps} />
}
export function CollapsibleText(
  reactProps: CollapsibleTextProps,
): preact.JSX.Element {
  return <tui-collapsible-text {...reactProps} />
}
export function ConsoleLog(reactProps: ConsoleProps): preact.JSX.Element {
  return <tui-console {...reactProps} />
}
export function Digits(reactProps: DigitsProps): preact.JSX.Element {
  return <tui-digits {...reactProps} />
}
export function H1(reactProps: HeaderProps): preact.JSX.Element {
  return <tui-h1 {...reactProps} />
}
export function H2(reactProps: HeaderProps): preact.JSX.Element {
  return <tui-h2 {...reactProps} />
}
export function H3(reactProps: HeaderProps): preact.JSX.Element {
  return <tui-h3 {...reactProps} />
}
export function H4(reactProps: HeaderProps): preact.JSX.Element {
  return <tui-h4 {...reactProps} />
}
export function H5(reactProps: HeaderProps): preact.JSX.Element {
  return <tui-h5 {...reactProps} />
}
export function H6(reactProps: HeaderProps): preact.JSX.Element {
  return <tui-h6 {...reactProps} />
}
export function Input(reactProps: InputProps): preact.JSX.Element {
  return <tui-input {...reactProps} />
}

interface Separator {
  (reactProps: SeparatorProps): preact.JSX.Element
  horizontal(reactProps: Omit<SeparatorProps, 'direction'>): preact.JSX.Element
  vertical(reactProps: Omit<SeparatorProps, 'direction'>): preact.JSX.Element
}
export const Separator: Separator = function Separator(
  reactProps: SeparatorProps,
): preact.JSX.Element {
  return <tui-separator {...reactProps} />
}
Separator.horizontal = function SeparatorHorizontal(
  reactProps: Omit<SeparatorProps, 'direction'>,
) {
  return <tui-separator direction="horizontal" {...reactProps} />
}
Separator.vertical = function SeparatorHorizontal(
  reactProps: Omit<SeparatorProps, 'direction'>,
) {
  return <tui-separator direction="vertical" {...reactProps} />
}

interface Slider {
  (reactProps: SliderProps): preact.JSX.Element
  horizontal(reactProps: Omit<SliderProps, 'direction'>): preact.JSX.Element
  vertical(reactProps: Omit<SliderProps, 'direction'>): preact.JSX.Element
}
export const Slider: Slider = function Slider(
  reactProps: SliderProps,
): preact.JSX.Element {
  return <tui-slider {...reactProps} />
}
Slider.horizontal = function SliderHorizontal(
  reactProps: Omit<SliderProps, 'direction'>,
) {
  return <tui-slider direction="horizontal" {...reactProps} />
}
Slider.vertical = function SliderHorizontal(
  reactProps: Omit<SliderProps, 'direction'>,
) {
  return <tui-slider direction="vertical" {...reactProps} />
}

export function Space(reactProps: SpaceProps): preact.JSX.Element {
  return <tui-space {...reactProps} />
}
export function ToggleGroup(reactProps: ToggleGroupProps): preact.JSX.Element {
  return <tui-toggle-group {...reactProps} />
}

interface TreeProps<T> extends ViewProps {
  data: T[]
  render: (datum: T) => React.ReactNode
  getChildren?: (datum: T) => T[] | undefined
  title: React.ReactNode | string
}
export function Tree<T>(reactProps: TreeProps<T>): preact.JSX.Element {
  const {title, ...props} = reactProps
  const titleView = useMemo(() => {
    if (typeof title === 'string') {
      return <tui-text>{title}</tui-text>
    }
    return title
  }, [title])
  return <tui-tree {...props}>{titleView}</tui-tree>
}

////
/// "Simple" containers
//

export function Box(reactProps: BoxProps): preact.JSX.Element {
  const {children, ...props} = reactProps
  return <tui-box {...props}>{children}</tui-box>
}
export function Button(reactProps: ButtonProps): preact.JSX.Element {
  const {children, ...props} = reactProps
  return <tui-button {...props}>{children}</tui-button>
}
export function Collapsible(reactProps: CollapsibleProps): preact.JSX.Element {
  const {collapsed, expanded, ...props} = reactProps
  return (
    <tui-collapsible {...props}>
      {collapsed}
      {expanded}
    </tui-collapsible>
  )
}

interface Stack {
  (reactProps: StackProps): preact.JSX.Element
  down(reactProps: Omit<StackProps, 'direction'>): preact.JSX.Element
  up(reactProps: Omit<StackProps, 'direction'>): preact.JSX.Element
  left(reactProps: Omit<StackProps, 'direction'>): preact.JSX.Element
  right(reactProps: Omit<StackProps, 'direction'>): preact.JSX.Element
}
export const Stack: Stack = function Stack(reactProps: StackProps) {
  const {children, ...props} = reactProps
  return <tui-stack {...props}>{children}</tui-stack>
}
Stack.down = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <tui-stack direction="down" {...props}>
      {children}
    </tui-stack>
  )
}
Stack.up = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <tui-stack direction="up" {...props}>
      {children}
    </tui-stack>
  )
}
Stack.right = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <tui-stack direction="right" {...props}>
      {children}
    </tui-stack>
  )
}
Stack.left = function StackLeft(reactProps: Omit<StackProps, 'direction'>) {
  const {children, ...props} = reactProps
  return (
    <tui-stack direction="left" {...props}>
      {children}
    </tui-stack>
  )
}
export function Scrollable(reactProps: ScrollableProps): preact.JSX.Element {
  const {children, ...props} = reactProps
  return <tui-scrollable {...props}>{children}</tui-scrollable>
}
/**
 * <Style /> is similar to <Text/> but only allows inline styles (bold, etc).
 * Does not support align or wrap (block styles). Does not support 'font', because
 * font is not encodable via SGR codes (and that's how I'm styling and
 * concatenating the text nodes).
 */
export function Style(reactProps: StyleProps): preact.JSX.Element {
  return <tui-style {...reactProps} />
}
/**
 * <Text /> is a container that sets the text properties of child TextLiterals
 * (font, style) and TextContainers (wrap, alignment)
 */
export function Text(reactProps: TextProps): preact.JSX.Element {
  return <tui-text {...reactProps} />
}

////
/// "Complex" containers
//

interface Accordion {
  (reactProps: AccordionProps): preact.JSX.Element
  Section(
    reactProps: Omit<AccordionSectionProps, 'direction'>,
  ): preact.JSX.Element
}
export const Accordion: Accordion = function Accordion(
  reactProps: AccordionProps,
): preact.JSX.Element {
  const {children, ...props} = reactProps
  return <tui-accordion {...props}>{children}</tui-accordion>
}
Accordion.Section = function SliderHorizontal(
  reactProps: Omit<AccordionSectionProps, 'direction'>,
) {
  const {children, ...props} = reactProps
  return <tui-accordion-section {...props}>{children}</tui-accordion-section>
}

interface Drawer {
  (reactProps: DrawerProps): preact.JSX.Element
  top(reactProps: Omit<DrawerProps, 'location'>): preact.JSX.Element
  right(reactProps: Omit<DrawerProps, 'location'>): preact.JSX.Element
  bottom(reactProps: Omit<DrawerProps, 'location'>): preact.JSX.Element
  left(reactProps: Omit<DrawerProps, 'location'>): preact.JSX.Element
}
export const Drawer: Drawer = function Drawer(
  reactProps: DrawerProps,
): preact.JSX.Element {
  const {children, content, drawer, ...props} = reactProps
  return (
    <tui-drawer {...props}>
      {content}
      {drawer}
      {children}
    </tui-drawer>
  )
}
Drawer.top = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, content, drawer, ...props} = reactProps
  return (
    <tui-drawer location="top" {...props}>
      {content}
      {drawer}
      {children}
    </tui-drawer>
  )
}
Drawer.right = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, content, drawer, ...props} = reactProps
  return (
    <tui-drawer location="right" {...props}>
      {content}
      {drawer}
      {children}
    </tui-drawer>
  )
}
Drawer.bottom = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, ...props} = reactProps
  return (
    <tui-drawer location="bottom" {...props}>
      {children}
    </tui-drawer>
  )
}
Drawer.left = function DrawerLeft(reactProps: Omit<DrawerProps, 'location'>) {
  const {children, ...props} = reactProps
  return (
    <tui-drawer location="left" {...props}>
      {children}
    </tui-drawer>
  )
}

interface Tabs {
  (reactProps: TabsProps): preact.JSX.Element
  Section(reactProps: Omit<TabsSectionProps, 'direction'>): preact.JSX.Element
}
export const Tabs: Tabs = function Tabs(
  reactProps: TabsProps,
): preact.JSX.Element {
  const {children, ...props} = reactProps
  return <tui-tabs {...props}>{children}</tui-tabs>
}
Tabs.Section = function SliderHorizontal(
  reactProps: Omit<TabsSectionProps, 'direction'>,
) {
  const {children, ...props} = reactProps
  return <tui-tabs-section {...props}>{children}</tui-tabs-section>
}
