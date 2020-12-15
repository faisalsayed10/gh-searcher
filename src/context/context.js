import React, { useState, useEffect, createContext } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    const res = await axios(`${rootUrl}/users/${user}`)
    .catch((err) => {
      console.error(err)
    });
    if (res) {
      // Setting the fetched Github user
      setGithubUser(res.data);
      const {repos_url, followers_url} = res.data;

      // Getting that user's follower list
      const followersRes = axios(`${followers_url}?per_page=100`);
      setFollowers(followersRes.data);

      // Getting that user's repositories
      const repoRes = axios(`${repos_url}?per_page=100`);
      setRepos(repoRes.data);

    } else {
      toggleError(true, "There is no user with that username");
    }
    fetchRateLimit();
    setLoading(false);
  };

  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }

  async function fetchRateLimit() {
    try {
      const res = await axios(`${rootUrl}/rate_limit`);
      let remaining = await res.data.rate.remaining;
      setRequests(remaining);
      await console.log(requests)
      if (remaining === 0) {
        toggleError(true, "Sorry, you have exceeded your hourly rate limit.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(fetchRateLimit, []);

  return (
    <GithubContext.Provider
      value={{ githubUser, repos, followers, error, searchGithubUser, loading }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
