import type { ReactNode } from 'react'

type Block =
  | { type: 'h1' | 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g
  let cursor = 0
  let key = 0

  for (const match of text.matchAll(pattern)) {
    const token = match[0]
    const index = match.index
    if (index > cursor) nodes.push(text.slice(cursor, index))
    if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    }
    key += 1
    cursor = index + token.length
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

function tableCells(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())
}

const ORDERED_ITEM = /^(\d+)\.\s+(.*)$/

function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (line.trim() === '') {
      index += 1
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) })
      index += 1
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) })
      index += 1
      continue
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2) })
      index += 1
      continue
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (index < lines.length && lines[index].startsWith('|')) {
        tableLines.push(lines[index])
        index += 1
      }
      const [header, , ...rest] = tableLines
      blocks.push({
        type: 'table',
        headers: tableCells(header),
        rows: rest.map(tableCells),
      })
      continue
    }

    if (line.startsWith('- ')) {
      const items: string[] = []
      while (index < lines.length && lines[index].startsWith('- ')) {
        items.push(lines[index].slice(2))
        index += 1
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (ORDERED_ITEM.test(line)) {
      const items: string[] = []
      while (index < lines.length && ORDERED_ITEM.test(lines[index])) {
        items.push(lines[index].replace(ORDERED_ITEM, '$2'))
        index += 1
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const paragraph: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !lines[index].startsWith('#') &&
      !lines[index].startsWith('|') &&
      !lines[index].startsWith('- ') &&
      !ORDERED_ITEM.test(lines[index])
    ) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') })
  }

  return blocks
}

type MarkdownProps = {
  source: string
  omitTitle?: boolean
}

export function Markdown({ source, omitTitle = false }: MarkdownProps) {
  const blocks = parseMarkdown(source).filter((block) => !(omitTitle && block.type === 'h1'))

  return (
    <div className="theory-lesson">
      {blocks.map((block, index) => {
        if (block.type === 'h1') {
          return (
            <h2 className="theory-lesson-title" key={index}>
              {inline(block.text)}
            </h2>
          )
        }
        if (block.type === 'h2') return <h3 key={index}>{inline(block.text)}</h3>
        if (block.type === 'h3') return <h4 key={index}>{inline(block.text)}</h4>
        if (block.type === 'ul') {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{inline(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'ol') {
          return (
            <ol key={index}>
              {block.items.map((item) => (
                <li key={item}>{inline(item)}</li>
              ))}
            </ol>
          )
        }
        if (block.type === 'table') {
          return (
            <div className="theory-table-wrap" key={index}>
              <table>
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header} scope="col">
                        {inline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.join('|')}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`}>{inline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return <p key={index}>{inline(block.text)}</p>
      })}
    </div>
  )
}
