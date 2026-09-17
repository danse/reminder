import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { ToastProvider } from '../components/Toast'
import { createTextNote } from '../db/notes'

describe('App shell', () => {
  it('renders the app shell with the sidebar', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(await screen.findByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('new-text-note')).toBeInTheDocument()
    expect(screen.getByTestId('language-select')).toBeInTheDocument()
  })

  it('shows the note list by default and the editor when a note is selected', async () => {
    const note = await createTextNote({ title: 'Draft', content: '# Hello' })

    render(
      <MemoryRouter initialEntries={[`/note/${note.id}`]}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('editor-view')).toBeInTheDocument()
    expect(screen.getByTestId('editor-back')).toBeInTheDocument()
    expect(screen.queryByTestId('note-list')).not.toBeInTheDocument()
  })
})