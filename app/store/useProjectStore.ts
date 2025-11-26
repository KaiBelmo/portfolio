import { create } from "zustand";
import { projects as initProjectState } from "@/data/projects";
import { Project } from "@/types/project";
import { GET as FetchGithubStars } from "../api/github/stars/route";
import { GithubStarsResponse } from "@/types/github";

interface ProjectState {
    projects: Project[];
    isItFetched: boolean;
    updateStars: (starsMap: Map<string, string>) => void;
    fetchStars: () => void;
    getSelectedProjects: (max: number) => Project[];
}

export const useProjectsStore = create<ProjectState>((set, get) => ({
    projects: initProjectState,
    isItFetched: false,
    updateStars: (starsMap: Map<string, string>) => {
        set((state) => ({
            projects: state.projects.map(p => {
                const stars = starsMap.get(p.id);
                return stars !== undefined ? { ...p, stars: stars ?? 0 } : p;
            })
        }));
    },
    fetchStars: async () => {
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
            
            set({ isItFetched: true });
        } catch (error) {
            console.error("Error fetching GitHub stars:", error);
            set({ isItFetched: true });
        }
    },

    getSelectedProjects: (max: number) => {
        return get().projects.slice(0, max);
    },
}));
