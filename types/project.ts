export interface Project {
  id: string;
  slug: string;
  name: string;
  link?: string;
  githubLink: string;
  description: string;
  category: string[];
  typeOfProject: string;
  date: string;
  imageLink: string; // For backward compatibility
  imagePosition: 'left' | 'center' | 'right'; // Controls image object position
  coverSeconds?: number; // Seconds into the recording to show as cover/thumbnail
  features?: string[]; // Array of project features/highlights
  stars?: string; // GitHub stars count
  disciplines?: string[];
  technologies?: string[];
  projectType?: string;
  role?: string;
  homepageEvidence?: string;
  owned?: string;
  hardProblem?: string;
  result?: string;
  visualType?: "browser" | "application" | "terminal" | "raw";
  classification?: string;
  imageVariant?: string;
  pullRequests?: { number: string; url: string; title?: string }[];
}
