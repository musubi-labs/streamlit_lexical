import React from "react"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import ToolbarPlugin from "./plugins/ToolbarPlugin"

import theme from "./theme"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown"

import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { CodeNode } from "@lexical/code"
import {
  ListNode,
  ListItemNode,
  $isListNode,
  $isListItemNode,
  $createListNode,
} from "@lexical/list"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import { LinkNode } from "@lexical/link"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import {
  $getRoot,
  $createParagraphNode,
  $isLineBreakNode,
  CLEAR_HISTORY_COMMAND,
} from "lexical"

/**
 * Post-processes the Lexical tree after markdown import to fix incorrectly
 * merged list items. Lexical's markdown importer treats non-list lines
 * immediately after a list item (without a blank line separator) as
 * "lazy continuation lines" and appends them to the last list item via a
 * LineBreakNode. This function detects that pattern, extracts the merged
 * content back into separate ParagraphNodes, and splits the list as needed
 * so the document structure matches the user's intent.
 *
 * This approach modifies the tree (not the markdown string), so the
 * round-trip export produces the same markdown the user originally saved.
 */
function $splitMergedListItems(): void {
  const root = $getRoot()
  const children = [...root.getChildren()]

  for (const child of children) {
    if (!$isListNode(child)) continue

    const listNode = child
    const listType = listNode.getListType()
    const listStart = listNode.getStart()
    const listItems = [...listNode.getChildren()]

    // Quick check: does any list item have a LineBreakNode?
    let needsSplit = false
    for (const item of listItems) {
      if ($isListItemNode(item)) {
        for (const itemChild of item.getChildren()) {
          if ($isLineBreakNode(itemChild)) {
            needsSplit = true
            break
          }
        }
      }
      if (needsSplit) break
    }

    if (!needsSplit) continue

    // Rebuild the document fragment that will replace this ListNode.
    // When a ListItemNode contains a LineBreakNode we:
    //   1. Keep everything before the first LineBreak in the list item.
    //   2. Flush the accumulated list items into a new ListNode.
    //   3. Turn each chunk of content between LineBreaks into a ParagraphNode.
    // Any subsequent list items (without LineBreaks) start a fresh list.
    const replacements: any[] = []
    let pendingListItems: any[] = []

    const flushPendingList = () => {
      if (pendingListItems.length > 0) {
        const newList = $createListNode(listType, listStart)
        for (const li of pendingListItems) {
          newList.append(li)
        }
        replacements.push(newList)
        pendingListItems = []
      }
    }

    for (const item of listItems) {
      if (!$isListItemNode(item)) {
        pendingListItems.push(item)
        continue
      }

      const itemChildren = [...item.getChildren()]
      const firstBreakIdx = itemChildren.findIndex((c) => $isLineBreakNode(c))

      if (firstBreakIdx === -1) {
        // No merged content – keep as-is
        pendingListItems.push(item)
        continue
      }

      // This item has merged content. Keep it (trimmed) then flush the list.
      pendingListItems.push(item)
      flushPendingList()

      // Walk from the first LineBreak onward, creating a new ParagraphNode
      // for each segment separated by LineBreakNodes.
      let currentPara = $createParagraphNode()

      for (let i = firstBreakIdx; i < itemChildren.length; i++) {
        const node = itemChildren[i]
        if ($isLineBreakNode(node)) {
          // Flush the previous paragraph if it has content
          if (currentPara.getChildrenSize() > 0) {
            replacements.push(currentPara)
          }
          currentPara = $createParagraphNode()
          node.remove() // remove LineBreak from the list item
        } else {
          currentPara.append(node) // moves the node out of the list item
        }
      }

      if (currentPara.getChildrenSize() > 0) {
        replacements.push(currentPara)
      }
    }

    flushPendingList()

    // Splice replacement nodes into the tree where the original list was
    let insertPoint: any = listNode
    for (const node of replacements) {
      insertPoint.insertAfter(node)
      insertPoint = node
    }
    listNode.remove()
  }
}

interface State {
  editorState: string
}

interface Props {
  min_height: number
  value: string
  placeholder: string
  debounce: number
  key: string
  overwrite: boolean
}

class StreamlitLexical extends StreamlitComponentBase<State, Props> {
  public state: State = {
    editorState: "",
  }
  private markdownRef = { current: this.props.args.value }
  private sentValues: string[] = [this.props.args.value]

  private editorConfig = {
    namespace: `MyStreamlitRichTextEditor-${this.props.args.key}`,
    theme,
    onError: (error: Error) => {
      console.error("Lexical error:", error)
    },
    editorState: () => {
      $convertFromMarkdownString(
        this.props.args.value,
        TRANSFORMERS,
        undefined,
        true
      )
      $splitMergedListItems()
    },
    nodes: [
      HorizontalRuleNode,
      HeadingNode,
      QuoteNode,
      CodeNode,
      ListNode,
      ListItemNode,
      LinkNode,
    ],
  }

  public render = (): React.ReactNode => {
    const { theme, args } = this.props
    const style: React.CSSProperties = {}

    if (theme) {
      style.borderColor = theme.primaryColor
    }

    return (
      <div style={style} className="streamlit-lexical-editor">
        <LexicalComposer initialConfig={this.editorConfig}>
          <EditorContentUpdater
            content={args.value}
            overwrite={args.overwrite}
            sentValues={this.sentValues}
          />
          <div className="editor-container">
            <ToolbarPlugin />
            <div className="editor-inner">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="editor-input"
                    style={{
                      minHeight: `${args.min_height}px`,
                      maxHeight: `${args.min_height}px`,
                      overflowY: "auto",
                    }}
                  />
                }
                placeholder={<Placeholder text={args.placeholder} />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <ListPlugin />
              <TabIndentationPlugin />
              {/* <TreeViewPlugin /> */}
              <OnChangePlugin onChange={this.handleEditorChange} />
              {/* <EditorUpdateListener /> */}
            </div>
          </div>
        </LexicalComposer>
      </div>
    )
  }

  private handleEditorChange = (editorState: any) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS, undefined, true)
      this.debouncedSetComponentValue(markdown)
    })
  }

  private debouncedSetComponentValue = debounce((value: string) => {
    this.markdownRef.current = value
    this.sentValues.push(value)
    if (this.sentValues.length > 20) {
      this.sentValues = this.sentValues.slice(-10)
    }
    Streamlit.setComponentValue(value)
  }, this.props.args.debounce)
}

function EditorContentUpdater({
  content,
  overwrite,
  sentValues,
}: {
  content: string
  overwrite: boolean
  sentValues: string[]
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const idx = sentValues.indexOf(content)
    if (idx !== -1) {
      sentValues.splice(0, idx + 1)
      return
    }

    editor.update(() => {
      const root = $getRoot()
      if (root.getTextContent() === "" || overwrite) {
        root.clear()
        $convertFromMarkdownString(content, TRANSFORMERS, undefined, true)
        $splitMergedListItems()
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
      }
    })
    sentValues.length = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, content, overwrite])

  return null
}

function Placeholder({ text }: { text: string }) {
  return <div className="editor-placeholder">{text}</div>
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

export default withStreamlitConnection(StreamlitLexical)
