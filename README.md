# Cloud-Box Frontend

A modern cloud storage frontend application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- File management (upload, download, delete, move)
- Folder navigation
- File sharing capabilities
- User authentication
- Activity tracking
- Trash management
- Responsive design with modern UI components

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── app/               # Main application routes
│   ├── login/             # Authentication pages
│   └── register/
├── components/            # React components
│   └── ui/               # UI component library
├── services/             # API service layer
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── public/               # Static assets
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## License

MIT
