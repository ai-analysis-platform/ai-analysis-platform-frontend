"use client";

import styled from "@emotion/styled";

type MarkdownContentProps = {
  content: string;
};

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <InlineCode key={`${part}-${index}`}>{part.slice(1, -1)}</InlineCode>;
    }
    return part;
  });
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.split("\n").map((line) => line.replace(/\r/g, ""));

  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <List key={`list-${nodes.length}`}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </List>,
    );
    listItems = [];
  };

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    nodes.push(
      <Paragraph key={`paragraph-${nodes.length}`}>
        {renderInlineMarkdown(paragraphLines.join(" "))}
      </Paragraph>,
    );
    paragraphLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      flushParagraph();
      nodes.push(
        <Heading3 key={`h3-${nodes.length}`}>
          {renderInlineMarkdown(line.slice(4))}
        </Heading3>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      flushParagraph();
      nodes.push(
        <Heading2 key={`h2-${nodes.length}`}>
          {renderInlineMarkdown(line.slice(3))}
        </Heading2>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      flushParagraph();
      nodes.push(
        <Heading1 key={`h1-${nodes.length}`}>
          {renderInlineMarkdown(line.slice(2))}
        </Heading1>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    paragraphLines.push(line);
  }

  flushList();
  flushParagraph();

  return <Wrapper>{nodes}</Wrapper>;
}

const Wrapper = styled.div`
  color: var(--foreground);
`;

const Heading1 = styled.h2`
  margin: 0 0 12px;
  font-size: 22px;
  line-height: 1.35;
`;

const Heading2 = styled.h3`
  margin: 18px 0 10px;
  font-size: 18px;
  line-height: 1.4;
`;

const Heading3 = styled.h4`
  margin: 16px 0 8px;
  font-size: 16px;
  line-height: 1.45;
`;

const Paragraph = styled.p`
  margin: 0 0 12px;
  line-height: 1.75;
  white-space: normal;
`;

const List = styled.ul`
  margin: 0 0 14px;
  padding-left: 20px;
  line-height: 1.75;

  li {
    margin: 4px 0;
  }
`;

const InlineCode = styled.code`
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.06);
  font-size: 0.95em;
`;
