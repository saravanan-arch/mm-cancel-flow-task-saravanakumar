import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ children, className = "" }) => {
  // Convert <br/> tags to actual line breaks for better markdown processing
  const processedContent = children
    .replace(/<br\s*\/?>/gi, '\n\n')
    .replace(/<br\s*>/gi, '\n\n');

  return (
    <ReactMarkdown
      // className={`prose prose-sm max-w-none ${className}`}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        // Customize paragraph styling
        p: ({ children, ...props }) => (
          <p className="" {...props}>
            {children}
          </p>
        ),
        // Customize strong/bold text
        strong: ({ children, ...props }) => (
          <strong className="font-semibold" {...props}>
            {children}
          </strong>
        ),
        // Customize emphasis/italic text
        em: ({ children, ...props }) => (
          <em className="" {...props}>
            {children}
          </em>
        ),
        u: ({ children, ...props }) => (
          <u className="" {...props}>
            {children}
          </u>
        ),
        sub: ({ children, ...props }) => (
          <sub className="text-xs top-0" {...props}>{children}</sub>
        ),
        ul: ({ children, ...props }) => (
          <ul className="mt-5" {...props}>
            {children}
          </ul>
        ),
        li: ({ children, ...props }) => (
          <li className="" {...props}>
            {children}
          </li>
        ),
        // Handle span tags
        span: ({ children, ...props }) => (
          <span className="" {...props}>
            {children}
          </span>
        ),
        // Handle line breaks
        br: () => <br className="block h-2" />,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};
