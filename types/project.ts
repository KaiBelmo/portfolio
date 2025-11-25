export interface Project {
  id: string;
  slug: string; // used in route /projects/[slug]
  name: string;
  link?: string;
  githubLink: string;
  description: string;
  category: string[];
  typeOfProject: string;
  date: string;
  imageLink: string; // For backward compatibility
  imagePosition: 'left' | 'center' | 'right'; // Controls image object position
  asciinemaId?: string; // ID from asciinema.org for terminal recordings
  coverSeconds?: number; // Seconds into the recording to show as cover/thumbnail
  features?: string[]; // Array of project features/highlights
  stars?: string; // GitHub stars count
}
