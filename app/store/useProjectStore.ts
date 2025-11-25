import { create } from "zustand";
import { projects as initProjectState } from "@/data/projects";
import { Project } from "@/types/project";
import { FetchGithubStars } from "../api/github/stars/route";
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
            if (!(res instanceof Response && res.ok)) {
                throw new Error("API handler failed");
            }

            const data: GithubStarsResponse = await res.json();
            console.log("GitHub stars:", data);
            const starsMap = new Map(data.map(i => [i.id, i.stars]));
            get().updateStars(starsMap);
            set({ isItFetched: true });
        } catch (error) {
            console.error("Error fetching GitHub stars:", error);
        }
    },

    getSelectedProjects: (max: number) => {
        return get().projects.slice(0, max);
    },
}));
