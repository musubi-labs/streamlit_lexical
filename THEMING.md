# Theming Guide

The streamlit_lexical component supports customizable themes to change the **editor's appearance**.

## What is Theming?

**Theming** allows you to customize the visual appearance of the Lexical editor by controlling:

- **Colors** - Background, text, and accent colors
- **Typography** - Font sizes, weights, and families  
- **Spacing** - Padding and margins
- **Borders** - Border styles, colors, and shadows
- **Toolbar** - Button styles and layout
- **Elements** - Headings, quotes, code blocks, links, and more

Themes transform the editor's look and feel to match your application's design system.

---

## Quick Start

### Preset Themes

Use one of the built-in themes:

```python
from streamlit_lexical import streamlit_lexical

# Dark theme for low-light environments
markdown = streamlit_lexical(
    value="# Hello World",
    theme="dark",
    height=400
)
```

**Available presets:**
- `"default"` - Clean, professional light theme
- `"dark"` - Dark background with light text
- `"minimal"` - Simple, content-focused design

### Custom Themes

Define your own CSS class mappings:

```python
import streamlit as st
from streamlit_lexical import streamlit_lexical

# Define custom CSS
st.markdown("""
<style>
.my-bold { font-weight: 700; color: #e74c3c; }
.my-h1 { font-size: 2.5rem; color: #3498db; border-bottom: 3px solid #3498db; }
</style>
""", unsafe_allow_html=True)

# Apply custom theme
custom_theme = {
    "text": {"bold": "my-bold"},
    "heading": {"h1": "my-h1"}
}

markdown = streamlit_lexical(
    value="content",
    theme=custom_theme
)
```

## Theme Configuration

### Complete Theme Structure

```python
theme = {
    "text": {
        "bold": "css-class-name",
        "italic": "css-class-name",
        "underline": "css-class-name",
        "strikethrough": "css-class-name",
        "code": "css-class-name",
    },
    "heading": {
        "h1": "css-class-name",
        "h2": "css-class-name",
        "h3": "css-class-name",
        "h4": "css-class-name",
        "h5": "css-class-name",
        "h6": "css-class-name",
    },
    "list": {
        "ul": "css-class-name",
        "ol": "css-class-name",
        "listitem": "css-class-name",
        "nested": {
            "listitem": "css-class-name"
        }
    },
    "code": "css-class-name",
    "link": "css-class-name",
    "quote": "css-class-name",
    "paragraph": "css-class-name",
}
```

### Partial Themes

You can customize only specific elements - the rest will use default styling:

```python
partial_theme = {
    "heading": {"h1": "custom-h1"},  # Only customize h1
    "text": {"bold": "custom-bold"}   # Only customize bold
}

streamlit_lexical(value="content", theme=partial_theme)
```

## Preset Theme Details

### Default Theme
- Light background (#ffffff)
- Dark text (#555555)
- Professional appearance
- Box shadow for depth
- **Best for:** General use, documentation

### Dark Theme
- Dark background (#1e1e1e)
- Light text (#d4d4d4)
- Reduced eye strain
- Blue accent colors
- **Best for:** Night coding, low-light environments

### Minimal Theme
- White background
- Simple borders (no shadows)
- Larger fonts and spacing
- Clean, distraction-free
- **Best for:** Writing, note-taking

## Examples

### Dynamic Theme Switching

```python
import streamlit as st
from streamlit_lexical import streamlit_lexical

theme_choice = st.selectbox(
    "Choose theme",
    ["default", "dark", "minimal"]
)

content = streamlit_lexical(
    value="# Sample Content",
    theme=theme_choice,
    height=300,
    key="editor"
)
```

### Branded Theme

```python
import streamlit as st

st.markdown("""
<style>
.brand-bold { font-weight: 700; color: #6366f1; }
.brand-h1 { 
    font-size: 2.5rem; 
    color: #4f46e5; 
    border-bottom: 3px solid #6366f1;
    padding-bottom: 0.5rem;
}
.brand-link { 
    color: #6366f1; 
    text-decoration: none; 
    border-bottom: 2px solid #6366f1;
}
.brand-quote {
    border-left: 5px solid #6366f1;
    padding-left: 1.5rem;
    background-color: #f5f3ff;
    padding: 1rem 1rem 1rem 1.5rem;
}
</style>
""", unsafe_allow_html=True)

brand_theme = {
    "text": {"bold": "brand-bold"},
    "heading": {"h1": "brand-h1"},
    "link": "brand-link",
    "quote": "brand-quote",
}

content = streamlit_lexical(
    value="Your content",
    theme=brand_theme
)
```

## API Reference

### Parameters

**theme** : `str | dict | None` (optional)
- **String**: Preset theme name (`"default"`, `"dark"`, `"minimal"`)
- **Dictionary**: Custom CSS class mappings
- **None**: Uses default theme

### Return Value

Returns the markdown content from the editor.

## Demo

Run the interactive theming demo:

```bash
streamlit run streamlit_lexical/example_theming.py
```

This demo shows all preset themes and demonstrates custom theme configuration.
