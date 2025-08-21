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
import { ListNode, ListItemNode } from "@lexical/list"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import { LinkNode } from "@lexical/link"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import { $getRoot, CLEAR_HISTORY_COMMAND } from "lexical"

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
  // track the markdown value to prevent unnecessary updates
  private markdownRef = { current: this.props.args.value }

  private editorConfig = {
    namespace: `MyStreamlitRichTextEditor-${this.props.args.key}`,
    theme,
    onError: (error: Error) => {
      console.error("Lexical error:", error)
    },
    editorState: () =>
      $convertFromMarkdownString(
        this.props.args.value,
        TRANSFORMERS,
        undefined,
        true
      ),
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
            currentMarkdown={this.markdownRef.current}
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
    Streamlit.setComponentValue(value)
  }, this.props.args.debounce)
}

function EditorContentUpdater({
  content,
  overwrite,
  currentMarkdown,
}: {
  content: string
  overwrite: boolean
  currentMarkdown: string
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (content === currentMarkdown) {
      return
    }
    editor.update(() => {
      const root = $getRoot()
      // Only set content if root is empty or overwrite is true
      if (root.getTextContent() === "" || overwrite) {
        root.clear()
        $convertFromMarkdownString(content, TRANSFORMERS, undefined, true)
        // Clear history to prevent undo to empty state
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
      }
    })
  }, [editor, content, overwrite, currentMarkdown])

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
