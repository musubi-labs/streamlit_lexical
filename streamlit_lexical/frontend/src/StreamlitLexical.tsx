import React from "react";
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import ToolbarPlugin from './plugins/ToolbarPlugin';

import theme from './theme';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';

import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import {ListNode, ListItemNode } from '@lexical/list'
import {ListPlugin} from '@lexical/react/LexicalListPlugin'
import {LinkNode} from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef, useLayoutEffect } from 'react';
import {
  $getRoot,
  $getSelection,
  RangeSelection,
  CLEAR_HISTORY_COMMAND,
  COPY_COMMAND,
  PASTE_COMMAND,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
} from 'lexical';

interface State {
  editorState: string;
}

interface Props {
  min_height: number;
  value: string;
  placeholder: string;
  debounce: number;
  key: string;
  overwrite: boolean;
}

class StreamlitLexical extends StreamlitComponentBase<State, Props> {
  public state: State = {
    editorState: '',
  };
  
  private editorConfig = {
    namespace: `MyStreamlitRichTextEditor-${this.props.args.key}`,
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    nodes: [HorizontalRuleNode, HeadingNode, QuoteNode, CodeNode, ListNode, ListItemNode, LinkNode],
  };

  public render = (): React.ReactNode => {
    const { theme, args } = this.props;
    const style: React.CSSProperties = {};

    if (theme) {
      style.borderColor = theme.primaryColor;
    }

    return (
      <div style={style} className="streamlit-lexical-editor">
        <LexicalComposer initialConfig={this.editorConfig}>
        <EditorContentUpdater content={args.value} overwrite={args.overwrite}/>
          <div className="editor-container">
            <ToolbarPlugin />
            <div className="editor-inner">
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" style={{ minHeight: `${args.min_height}px`, maxHeight: `${args.min_height}px`, overflowY: 'auto' }} />}
                placeholder={<Placeholder text={args.placeholder} />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <MarkdownShortcutPlugin />
              <ListPlugin />
              {/* <TreeViewPlugin /> */}
              <OnChangePlugin onChange={this.handleEditorChange} />
              {/* <EditorUpdateListener /> */}
            </div>
          </div>
        </LexicalComposer>
      </div>
    );
  };

  private handleEditorChange = (editorState: any) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      // const jsonState = JSON.stringify(editorState.toJSON());
      // this.setState({ editorState: jsonState });
      this.debouncedSetComponentValue(markdown);
    });
  }
  
  private debouncedSetComponentValue = debounce((value: string) => {
    Streamlit.setComponentValue(value);
  }, this.props.args.debounce)
}

function EditorContentUpdater({ content, overwrite }: { content: string; overwrite: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      // Only set content if root is empty or overwrite is true
      if (root.getTextContent() === '' || overwrite) {
        root.clear();
        $convertFromMarkdownString(content, TRANSFORMERS);
        // Clear history to prevent undo to empty state
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor, content, overwrite]);
  // useEffect(() => {
  //   editor.update(() => {
  //     const root = $getRoot();
  //     root.clear();
  //     $convertFromMarkdownString(content, TRANSFORMERS);

  //     // Optionally, clear history to prevent undo issues
  //     editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);

  //     // Notify Streamlit of the content update
  //     const newMarkdown = $convertToMarkdownString(TRANSFORMERS);
  //     Streamlit.setComponentValue(newMarkdown);
  //   });
  // // Include 'updateCounter' in dependencies to trigger when it changes
  // }, [editor, content, overwrite]);

  useEffect(() => {
    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        event.preventDefault();
        const text = event.clipboardData?.getData('text/plain');
        if (text) {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertText(text);
              const markdown = $convertToMarkdownString(TRANSFORMERS);
              $convertFromMarkdownString(markdown, TRANSFORMERS);
            }
          });
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    // Cleanup function to unregister the paste handler when the component unmounts
    return () => {
      unregisterPaste();
    };
  }, [editor]);

  return null;
}


// function EditorContentUpdater({ content }: { content: string }) {
//   const [editor] = useLexicalComposerContext();
//   const contentRef = useRef(content);

//   // This effect runs on mount and updates the editor with the initial content
//   useLayoutEffect(() => {
//     editor.update(() => {
//       const root = $getRoot();
//       if (root.getTextContent() === '') {
//         $convertFromMarkdownString(content, TRANSFORMERS);
//       }
//     });
//   }, [editor]);

//   // This effect runs on every content change
//   useEffect(() => {
//     if (content !== contentRef.current) {
//       editor.update(() => {
//         const root = $getRoot();
//         const currentContent = $convertToMarkdownString(TRANSFORMERS);
//         if (content !== currentContent) {
//           root.clear();
//           $convertFromMarkdownString(content, TRANSFORMERS);
//         }
//       });
//       contentRef.current = content;
//     }
//   }, [editor, content]);

//   return null;
// }

// function EditorContentUpdater({ content }: { content: string }) {
//   const [editor] = useLexicalComposerContext();
//   const [isFocused, setIsFocused] = useState(false);
//   const [lastContent, setLastContent] = useState(content);

//   useEffect(() => {
//     const unregisterFocus = editor.registerCommand(
//       FOCUS_COMMAND,
//       () => {
//         setIsFocused(true);
//         return false;
//       },
//       COMMAND_PRIORITY_LOW
//     );

//     const unregisterBlur = editor.registerCommand(
//       BLUR_COMMAND,
//       () => {
//         setIsFocused(false);
//         return false;
//       },
//       COMMAND_PRIORITY_LOW
//     );

//     const unregisterPaste = editor.registerCommand(
//         PASTE_COMMAND,
//         (event: ClipboardEvent) => {
//           event.preventDefault();
//           const text = event.clipboardData?.getData('text/plain');
//           if (text) {
//             editor.update(() => {
//               const selection = $getSelection();
//               if ($isRangeSelection(selection)) {
//                 selection.insertText(text);
//                 const markdown = $convertToMarkdownString(TRANSFORMERS);
//                 $convertFromMarkdownString(markdown, TRANSFORMERS);
                
//               }
//             });
//           }
//           return true;
//         },
//         COMMAND_PRIORITY_LOW
//       );

//     return () => {
//       unregisterFocus();
//       unregisterBlur();
//       unregisterPaste();
//     };
//   }, [editor]);

//   useEffect(() => {
//     if (!isFocused) {
//       editor.update(() => {
//         const currentContent = $convertToMarkdownString(TRANSFORMERS);
//         if (content !== currentContent) {
//           const root = $getRoot();
//           const selection = $getSelection();
          
//           root.clear();
//           $convertFromMarkdownString(content, TRANSFORMERS);

//           if (selection) {
//             $setSelection(selection);
//           }

//           editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
//         }
//       });
//       setLastContent(content);
//     }
//   }, [editor, content, isFocused, lastContent]);

//   return null;
// }

function Placeholder({ text }: { text: string }) {
  return <div className="editor-placeholder">{text}</div>;
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default withStreamlitConnection(StreamlitLexical);