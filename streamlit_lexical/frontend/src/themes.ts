/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { EditorThemeClasses } from "lexical";

/**
 * Generates a theme configuration with optional suffix for class names
 * @param suffix - Optional suffix to append to class names (e.g., "-dark", "-minimal")
 * @returns Complete theme configuration
 */
function createTheme(suffix: string = ""): EditorThemeClasses {
  const withSuffix = (base: string) => `${base}${suffix}`;

  return {
    code: withSuffix("editor-code"),
    heading: {
      h1: withSuffix("editor-heading-h1"),
      h2: withSuffix("editor-heading-h2"),
      h3: withSuffix("editor-heading-h3"),
      h4: withSuffix("editor-heading-h4"),
      h5: withSuffix("editor-heading-h5"),
      h6: withSuffix("editor-heading-h6"),
    },
    image: withSuffix("editor-image"),
    link: withSuffix("editor-link"),
    list: {
      listitem: withSuffix("editor-listitem"),
      nested: {
        listitem: withSuffix("editor-nested-listitem"),
      },
      ol: withSuffix("editor-list-ol"),
      ul: withSuffix("editor-list-ul"),
    },
    ltr: "ltr",
    paragraph: withSuffix("editor-paragraph"),
    quote: withSuffix("editor-quote"),
    rtl: "rtl",
    text: {
      bold: withSuffix("editor-text-bold"),
      code: withSuffix("editor-text-code"),
      hashtag: withSuffix("editor-text-hashtag"),
      italic: withSuffix("editor-text-italic"),
      strikethrough: withSuffix("editor-text-strikethrough"),
      underline: withSuffix("editor-text-underline"),
      underlineStrikethrough: withSuffix("editor-text-underlineStrikethrough"),
    },
  };
}

// Preset themes
export const defaultTheme = createTheme();
export const darkTheme = createTheme("-dark");
export const minimalTheme = createTheme("-minimal");

// Theme presets map
export const themePresets: Record<string, EditorThemeClasses> = {
  default: defaultTheme,
  dark: darkTheme,
  minimal: minimalTheme,
};

/**
 * Merges a custom theme with the default theme
 * @param customTheme - Custom theme overrides
 * @returns Merged theme configuration
 */
export function mergeTheme(
  customTheme: Partial<EditorThemeClasses> | null | undefined
): EditorThemeClasses {
  if (!customTheme) {
    return defaultTheme;
  }

  // Deep merge for nested objects
  return {
    ...defaultTheme,
    ...customTheme,
    heading: {
      ...defaultTheme.heading,
      ...(customTheme.heading || {}),
    },
    list: {
      ...defaultTheme.list,
      ...(customTheme.list || {}),
      nested: {
        ...(defaultTheme.list?.nested || {}),
        ...(customTheme.list?.nested || {}),
      },
    },
    text: {
      ...defaultTheme.text,
      ...(customTheme.text || {}),
    },
  };
}

/**
 * Gets a theme by name (preset) or uses custom theme
 * @param themeConfig - Theme preset name or custom theme object
 * @returns Theme configuration
 */
export function getTheme(
  themeConfig: string | Partial<EditorThemeClasses> | null | undefined
): EditorThemeClasses {
  // If themeConfig is a string, try to get a preset
  if (typeof themeConfig === "string") {
    const preset = themePresets[themeConfig];
    if (preset) {
      return preset;
    }
    console.warn(
      `Theme preset "${themeConfig}" not found. Using default theme.`
    );
    return defaultTheme;
  }

  // If themeConfig is an object, merge it with default
  return mergeTheme(themeConfig);
}
