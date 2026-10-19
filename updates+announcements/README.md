# Writing announcements and updates

Edit `announcements.json` or `updates.json` and add an entry inside its top-level `items` array. Keep each item’s `title` and `date` (`YYYY-MM-DD`). Use either the simple `message` format or an ordered `content` array of blocks. Both files include a starter item showing the block format.

## Content blocks

Blocks render in the order they appear:

```json
{
  "title": "Update title",
  "date": "2026-10-19",
  "content": [
    { "type": "heading", "text": "Section heading", "level": 3 },
    { "type": "paragraph", "text": "Write a paragraph here." },
    { "type": "spacer", "size": "large" },
    {
      "type": "list",
      "items": ["First item", "Second item"],
      "ordered": false
    },
    {
      "type": "button",
      "text": "Read more",
      "url": "https://example.com",
      "style": "primary",
      "image": "https://example.com/image.jpg",
      "imageAlt": "Describe the image for accessibility",
      "description": "Optional text shown beside the image and above the button."
    }
  ]
}
```

- `heading`: set `text` and optionally `level` (`3`, `4`, or `5`) to add a section heading before a paragraph or other content.
- `paragraph`: set `text` to the paragraph content.
- `spacer`: set `size` to `small`, `medium`, or `large` for vertical space.
- `list`: set `items` to an array of strings; set `ordered` to `true` for a numbered list.
- `button`: set `text` and `url`; `style` can be `primary` or `secondary`. Optionally add `image`, `imageAlt`, and `description` to show a square image on the left (about one-third of the card) with text and the button on the right. Leave out `image` for a standard button.

Button links, images, and the legacy `link` field only load `http`/`https` URLs. Existing items using `message` and optional `link` continue to work; when `content` is provided, it is displayed instead of `message`.
