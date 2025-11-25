# My Portfolio

A sleek, interactive portfolio website built with Next.js, TypeScript, and Tailwind CSS. This project showcases my work, skills, and contributions in a modern, performant web application.

## ✨ Features

- **Project Showcase**: Beautifully display projects with detailed descriptions, technologies used, and live demos
- **GitHub Integration**: Automatically fetches and displays GitHub stars for repositories
- **Pull Request Parser**: Smart parsing of PR numbers from project descriptions to create direct links to GitHub PRs
- **Interactive UI**: Smooth animations and transitions powered by Framer Motion
- **Responsive Design**: Looks great on all devices and screen sizes
- **Type Safety**: Built with TypeScript for better developer experience and code quality

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand
- **Icons**: Lucide Icons
- **Deployment**: Vercel

## 🔍 PR Parsing Feature

The portfolio includes a smart PR parsing system that automatically detects and links to GitHub pull requests mentioned in project descriptions. Here's how it works:

1. **Automatic Detection**: Scans project descriptions for PR numbers (e.g., `#123`)
2. **Link Generation**: Converts PR numbers into clickable links to the corresponding GitHub PR
3. **Repository Context**: Uses the project's GitHub repository URL to create accurate PR links

### Example Usage
In your project descriptions, simply reference PRs like this:
```
Implemented feature X (see #123) and fixed bug Y (see #124)
```

This will automatically be converted to clickable links pointing to the respective pull requests in your GitHub repository.