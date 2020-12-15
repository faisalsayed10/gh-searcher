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
    const res = await axios(`${rootUrl}/users/${user}`).catch((err) => {
      console.error(err);
    });
    if (res) {
      // Setting the fetched Github user
      setGithubUser(res.data);
      const { repos_url, followers_url } = await res.data;

      // Getting that user's follower list
      const followersRes = await axios(`${followers_url}?per_page=100`);
      setFollowers(followersRes.data);

      // Getting that user's repositories
      const repoRes = await axios(`${repos_url}?per_page=100`);
      setRepos(repoRes.data);
      setLoading(false);
      fetchRateLimit();
    } else {
      toggleError(true, "There is no user with that username");
    }
  };

  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }

  async function fetchRateLimit() {
    try {
      const res = await axios(`${rootUrl}/rate_limit`);
      let remaining = await res.data.rate.remaining;
      setRequests(remaining);
      if (remaining === 0) {
        toggleError(true, "Sorry, you have exceeded your hourly rate limit.");
      }
      await console.log(requests);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchRateLimit();
    getLocalStorage();
  }, []);

  useEffect(() => {
    setLocalStorage()
  }, [githubUser, followers, repos])

  const setLocalStorage = () => {
    localStorage.setItem("Github user", JSON.stringify(githubUser));
    localStorage.setItem("Followers", JSON.stringify(followers));
    localStorage.setItem("Repos", JSON.stringify(repos));
  };

  const getLocalStorage = () => {
    if (localStorage.getItem("Github user") === null) {
      return;
    } else {
      let localGhUsers = JSON.parse(localStorage.getItem("Github user"));
      setGithubUser(localGhUsers);
      let localGhFollowers = JSON.parse(localStorage.getItem("Followers"));
      setFollowers(localGhFollowers);
      let localGhRepos = JSON.parse(localStorage.getItem("Repos"));
      setRepos(localGhRepos);
    }
  };

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        error,
        searchGithubUser,
        loading
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
