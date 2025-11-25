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
