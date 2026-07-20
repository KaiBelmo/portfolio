export const getUsernameAndRepo = (githubLink: string): { userName: string, repoName: string } => {
  const url = new URL(githubLink);
  const [userName, repoName] = url.pathname.split("/").filter(Boolean);

  return {
    userName,
    repoName
  }
}

export const parsePullRequestNumbers = (texts: string[]) => {
  const prRegex = /#(\d+)/g;
  const allNumbers: number[] = [];

  for (const text of texts) {
    const matches = text.matchAll(prRegex);
    const nums = Array.from(matches, (m) => parseInt(m[1], 10));
    allNumbers.push(...nums);
  }

  return allNumbers;
};


export const fetchPR = (prNumbers: Array<number>, githubLink: string) => {
  const { userName, repoName } = getUsernameAndRepo(githubLink);
  const prLinks = prNumbers.map((pr) => {
    return `https://github.com/${userName}/${repoName}/pull/${pr}`
  })
  return prLinks;

}

type GithubRequestInit = RequestInit & {
  next?: { revalidate?: number };
};

class GithubClient {
  private readonly token = process.env.GITHUB_TOKEN;

  get isConfigured(): boolean {
    return Boolean(this.token);
  }

  async requestJson<T>(url: string, init: GithubRequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Personal-Website",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...init.headers,
      },
    });

    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    return response.json() as Promise<T>;
  }
}

// One server-side GitHub client and one shared token configuration.
export const githubClient = new GithubClient();
