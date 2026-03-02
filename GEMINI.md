# Project Context: Template Creator

## Overview
This is a **Nuxt 3** application designed for visually building document layouts and generating PDFs. It features a drag-and-drop interface where users can construct templates using various HTML elements (divs, images, tables, paragraphs) and style them using Tailwind CSS. The application supports data injection via **Handlebars** and server-side PDF generation using **Puppeteer**.

## Tech Stack
*   **Framework:** Nuxt 3 (Vue 3)
*   **Styling:** Tailwind CSS 4
*   **State Management:** Pinia (with persistence via `pinia-plugin-persistedstate`)
*   **PDF Generation:** Puppeteer (running on the server via Nitro/H3)
*   **Editor:** Monaco Editor (for code/style editing)
*   **Templating:** Handlebars (for data binding)

## Architecture

### Directory Structure
*   `app/`: Main application source code.
    *   `components/`: Vue components, including layout parts (`layout/`) and UI elements (`ui/`, `svg/`).
    *   `pages/`: Application routes (SPA style, main logic in `index.vue`).
    *   `stores/`: Pinia stores.
        *   `templateStore.ts`: The core store managing the document schema, selection state, history (undo/redo), and interactions.
        *   `template.ts`: Utility functions for manipulating the schema tree (insert, delete, find).
*   `server/`: Backend logic.
    *   `api/pdf.post.ts`: POST endpoint that accepts HTML, renders it with Puppeteer, and returns a PDF buffer.
    *   `utils/puppeteer.ts`: Helper to manage Puppeteer instances.

### Key Concepts
*   **Schema:** The document structure is stored as a recursive tree of `ElementDataSet` objects (`{ id, tag, data, children }`).
*   **Preview:** The schema is converted to HTML string (`generateLayoutHtml`) and then compiled with Handlebars to inject sample data before being rendered in the DOM.
*   **Drag & Drop:** Native HTML5 Drag and Drop API is used. The store handles `drop` events to update the schema.
*   **PDF:** The generated HTML is sent to the server, where Puppeteer opens it in a headless browser and prints it to PDF.

## Development

### Setup & Run
1.  **Install dependencies:**
    ```bash
    pnpm install
    # or npm install
    ```

2.  **Run development server:**
    ```bash
    pnpm run dev
    # or npm run dev
    ```
    Access the app at `http://localhost:3000`.

3.  **Build for production:**
    ```bash
    pnpm run build
    # or npm run build
    ```

### Key Files
*   `app/stores/templateStore.ts`: **CRITICAL**. Contains most of the business logic, state, and event handlers.
*   `app/stores/template.ts`: Helper functions for tree traversal and manipulation.
*   `server/api/pdf.post.ts`: Handles the PDF generation logic.
*   `nuxt.config.ts`: Project configuration, including Tailwind and Pinia modules.

## Conventions
*   **Components:** Vue SFCs (`.vue`) using `<script setup>`.
*   **Styling:** Tailwind utility classes.
*   **State:** Centralized in Pinia stores; components should trigger store actions rather than mutating state directly where possible.
*   **Icons:** SVG components located in `app/components/svg/`.
