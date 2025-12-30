import { create } from "zustand";
import { projects as initProjectState } from "@/data/projects";
import { Project } from "@/types/project";
import { GET as FetchGithubStars } from "../api/github/stars/route";
import { GithubStarsResponse } from "@/types/github";

interface ProjectState {
    projects: Project[];
    isItFetched: boolean;
    isLoading: boolean;
    error: string | null;
    updateStars: (starsMap: Map<string, string>) => void;
    fetchStars: () => Promise<void>;
    getSelectedProjects: (max: number) => Project[];
}

export const useProjectsStore = create<ProjectState>((set, get) => ({
    projects: initProjectState,
    isItFetched: false,
    isLoading: false,
    error: null,
    updateStars: (starsMap: Map<string, string>) => {
        set((state) => ({
            projects: state.projects.map(p => {
                const stars = starsMap.get(p.id);
                return stars !== undefined ? { ...p, stars: stars ?? 0 } : p;
            })
        }));
    },
    fetchStars: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await FetchGithubStars();
            const data = await res.json();
            const starsMap = new Map<string, string>();
            if (Array.isArray(data)) {
                data.forEach((item: any) => {
                    if (item && item.id && item.stars !== undefined) {
                        starsMap.set(item.id, item.stars.toString());
                    }
                });
                
                if (starsMap.size > 0) {
                    get().updateStars(starsMap);
                }
            }
            
            set({ isItFetched: true, isLoading: false });
        } catch (error) {
            console.error("Error fetching GitHub stars:", error);
            set({ 
                isItFetched: true, 
                isLoading: false, 
                error: error instanceof Error ? error.message : "Failed to fetch stars" 
            });
        }
    },

    getSelectedProjects: (max: number) => {
        return get().projects.slice(0, max);
    },
}));
