import streamlit as st
from __init__ import streamlit_lexical

st.set_page_config(page_title="Lexical Theming Demo", layout="wide")

# Sample content for the editor
DEMO_CONTENT = """# Rich Text Editor

Edit this text and see how the theme affects the editor's appearance.

## Formatted Text

**Bold text**, *italic text*, and `inline code` all adapt to the selected theme.

> This is a quote block

### Lists

1. First item
2. Second item
3. Third item

- Bullet point
- Another point
- Last point
"""

# Initialize session state
if "editor_content" not in st.session_state:
    st.session_state["editor_content"] = DEMO_CONTENT

st.title("🎨 Lexical Theming Demo")

# ============================================
# SECTION 1: What is Theming
# ============================================
st.header("1️⃣ What is Theming")

st.markdown("""
**Theming** allows you to customize the visual appearance of the Lexical editor by controlling:

- **Colors** - Background, text, and accent colors
- **Typography** - Font sizes, weights, and families
- **Spacing** - Padding and margins
- **Borders** - Border styles, colors, and shadows
- **Toolbar** - Button styles and layout
- **Elements** - Headings, quotes, code blocks, links, and more

Themes transform the editor's look and feel to match your application's design system.
""")

# ============================================
# SECTION 2: How to Use It
# ============================================
st.header("2️⃣ How to Use It")

st.markdown("""
There are two ways to apply themes:
""")

col1, col2 = st.columns(2)

with col1:
    st.subheader("✨ Preset Themes")
    st.markdown("""
    Use built-in themes by passing the theme name:
    
    ```python
    from streamlit_lexical import streamlit_lexical
    
    streamlit_lexical(
        value="Your text here",
        theme="dark"  # or "minimal"
    )
    ```
    """)

with col2:
    st.subheader("🎨 Custom Themes")
    st.markdown("""
    Create custom themes with CSS classes:
    
    ```python
    custom_theme = {
        "text": {"bold": "my-bold-class"},
        "heading": {"h1": "my-h1-class"}
    }
    
    streamlit_lexical(
        value="Your text here",
        theme=custom_theme
    )
    ```
    """)

# ============================================
# SECTION 3: Examples
# ============================================
st.header("3️⃣ Examples")

tab1, tab2 = st.tabs(["Dark Mode Example", "Compact Mode Example"])

# -------------------------------------------
# Example 1: Dark Mode
# -------------------------------------------
with tab1:
    st.subheader("🌙 Dark Mode Theme")

    st.markdown("""
    Perfect for low-light environments and reducing eye strain. Features:
    - Dark background (#1e1e1e)
    - Light text (#d4d4d4)
    - Reduced contrast
    - Blue accent colors
    """)

    st.markdown("**Code:**")
    st.code("""
from streamlit_lexical import streamlit_lexical

markdown = streamlit_lexical(
    value="# Your content here",
    theme="dark",
    height=400
)
""", language="python")

    st.markdown("**Live Demo:**")
    dark_content = streamlit_lexical(
        value=st.session_state.get("dark_content", DEMO_CONTENT),
        placeholder="Type here to see the dark theme...",
        key="dark_editor",
        height=400,
        theme="dark",
        on_change=lambda: st.session_state.update(
            {"dark_content": st.session_state.get("dark_editor")}
        ),
    )

# -------------------------------------------
# Example 2: Compact Mode
# -------------------------------------------
with tab2:
    st.subheader("📱 Compact Mode Theme")

    # Define compact theme CSS
    st.markdown("""
    <style>
    .compact-container .editor-container {
        box-shadow: none !important;
        border: 1px solid #e0e0e0 !important;
    }
    .compact-container .toolbar {
        padding: 4px 6px !important;
        border-bottom: 1px solid #e0e0e0 !important;
    }
    .compact-container .toolbar button.toolbar-item {
        padding: 4px !important;
        margin: 0 1px !important;
    }
    .compact-container .editor-input {
        font-size: 14px !important;
        line-height: 1.4 !important;
        padding: 0.5rem !important;
    }
    .compact-container .editor-heading-h1 {
        font-size: 18px !important;
        margin: 0.25rem 0 !important;
    }
    .compact-container .editor-heading-h2 {
        font-size: 16px !important;
        margin: 0.25rem 0 !important;
    }
    .compact-container .editor-heading-h3 {
        font-size: 15px !important;
        margin: 0.25rem 0 !important;
    }
    .compact-container .editor-paragraph {
        margin: 0.25rem 0 !important;
    }
    .compact-container .editor-quote {
        border-left: 3px solid #ddd !important;
        padding-left: 0.75rem !important;
        margin: 0.5rem 0 !important;
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown("""
    Optimized for space-constrained interfaces. Features:
    - Minimal padding and margins
    - Smaller font sizes
    - Compact toolbar buttons
    - Subtle borders instead of shadows
    """)

    st.markdown("**Code:**")
    st.code("""
import streamlit as st
from streamlit_lexical import streamlit_lexical

# 1. Define compact CSS
st.markdown('''<style>
.compact-container .editor-input {
    font-size: 14px !important;
    padding: 0.5rem !important;
}
.compact-container .toolbar {
    padding: 4px 6px !important;
}
</style>''', unsafe_allow_html=True)

# 2. Use with custom wrapper
st.markdown('<div class="compact-container">', unsafe_allow_html=True)
markdown = streamlit_lexical(
    value="# Your content here",
    height=350
)
st.markdown('</div>', unsafe_allow_html=True)
""", language="python")

    st.markdown("**Live Demo:**")
    st.markdown('<div class="compact-container">', unsafe_allow_html=True)
    compact_content = streamlit_lexical(
        value=st.session_state.get("compact_content", DEMO_CONTENT),
        placeholder="Type here to see the compact theme...",
        key="compact_editor",
        height=350,
        on_change=lambda: st.session_state.update(
            {"compact_content": st.session_state.get("compact_editor")}
        ),
    )
    st.markdown('</div>', unsafe_allow_html=True)

# ============================================
# Additional Resources
# ============================================
st.markdown("---")
st.markdown("### 📚 Learn More")

with st.expander("View Full Theme Configuration Options"):
    st.markdown("""
    A theme can customize these elements:
    
    ```python
    theme = {
        "text": {
            "bold": "css-class-name",
            "italic": "css-class-name",
            "underline": "css-class-name",
            "strikethrough": "css-class-name",
            "code": "css-class-name"
        },
        "heading": {
            "h1": "css-class-name",
            "h2": "css-class-name",
            "h3": "css-class-name",
            "h4": "css-class-name",
            "h5": "css-class-name",
            "h6": "css-class-name"
        },
        "list": {
            "ul": "css-class-name",
            "ol": "css-class-name",
            "listitem": "css-class-name",
            "nested": {
                "listitem": "css-class-name"
            }
        },
        "link": "css-class-name",
        "quote": "css-class-name",
        "code": "css-class-name",
        "paragraph": "css-class-name"
    }
    ```
    
    Then define your CSS classes with the styles you want:
    
    ```css
    .my-bold { font-weight: 700; color: #e74c3c; }
    .my-h1 { font-size: 2.5rem; color: #3498db; }
    ```
    """)
