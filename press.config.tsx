import { defineConfig } from "fumapress";
import { fumadocsMdx } from "fumapress/adapters/mdx";
import { createDocsLayoutPage } from "fumapress/layouts/docs";
import { metaSchema, pageSchema } from "fumapress/adapters/mdx/schema";
import { flexsearchPlugin } from "fumapress/plugins/flexsearch";
import { defineDocs } from "fumadocs-mdx/macro";
import releases from "./data/releases.json";

const DocsLayout = createDocsLayoutPage<typeof config.$context>({
  render(page) {
    if (page.absolutePath?.endsWith("content/changelog.mdx")) {
      return {
        pageProps: {
          toc: releases.releases.map((release) => ({
            title: `${release.version}`,
            url: `#release-${release.version}`,
            depth: 1,
          })),
        },
      };
    }
    return {};
  },
});
const docs = defineDocs({
  dir: "content",
  docs: {
    async: true,
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  content: docs.toFumadocsSource(),
  site: {
    name: "fldanplay",
    baseUrl: "https://fldanplay.huangshi10492.top",
    git: {
      provider: "github",
      user: "huangshi10492",
      branch: "main",
      repo: "flutter_danmaku_player",
    },
  },
  renderPage: (props) => <DocsLayout {...props} />,
})
  .adapters(fumadocsMdx()).plugins(flexsearchPlugin());;
