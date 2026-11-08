# GitHub Pages Asset Path Repair

## Problem

The public site is published at `https://kyyberi.github.io/100daysofDX/`, while generated HTML contains root-relative local URLs such as `/assets/css/main.css`. GitHub Pages therefore requests `https://kyyberi.github.io/assets/css/main.css`, which returns `404`; the actual stylesheet at `/100daysofDX/assets/css/main.css` returns `200 text/css`.

## Scope

Set Jekyll's `baseurl` to `/100daysofDX` and convert every same-origin root-relative `href` or `src` in source templates, pages, and posts to use Jekyll's `relative_url` filter. External and protocol-relative URLs remain unchanged. Add a source-level regression test that rejects remaining root-relative local `href` and `src` attributes.

## Verification

Run the regression test, inspect a local generated build if the legacy Jekyll toolchain is available, and verify the published stylesheet requests return `200 text/css` after the GitHub Pages deployment completes.
