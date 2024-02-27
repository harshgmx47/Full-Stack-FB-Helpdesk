import React, { useEffect, useState } from "react";
import { BASE_URL, APP_ID } from "../../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from './UserContext'; // Import useUser hook

import "./inte.css";

const Integration = () => {
  const navigate = useNavigate();
  const { fetchedUserInfo, setFetchedUserInfo } = useUser(); // Use the useUser hook

  //loading facebook sdk
  // useEffect(() => {
  //   if (document.getElementById("facebook-jssdk")) return;

  //   window.fbAsyncInit = function () {
  //     FB.init({
  //       appId: APP_ID,
  //       cookie: true,
  //       xfbml: true,
  //       version: "v16.0",
  //     });

  //     FB.AppEvents.logPageView();
  //   };

  //   (function (d, s, id) {
  //     var js,
  //       fjs = d.getElementsByTagName(s)[0];
  //     if (d.getElementById(id)) return;
  //     js = d.createElement(s);
  //     js.id = id;
  //     js.src = "https://connect.facebook.net/en_US/sdk.js";
  //     fjs.parentNode.insertBefore(js, fjs);
  //   })(document, "script", "facebook-jssdk");
  // }, []);
  useEffect(() => {
    const loadFacebookSDK = () => {
      if (window.FB) return; // Facebook SDK is already loaded
  
      window.fbAsyncInit = function () {
        FB.init({
          appId: APP_ID,
          cookie: true,
          xfbml: true,
          version: "v16.0",
        });
  
        FB.AppEvents.logPageView();
      };
  
      // Load Facebook SDK
      (function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.crossorigin = "anonymous"; // Add crossorigin attribute
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    };
  
    // Check if the Facebook SDK script element already exists
    if (!document.getElementById("facebook-jssdk")) {
      loadFacebookSDK();
    } else {
      // Facebook SDK script element already exists, but FB object might not be initialized
      if (!window.FB) {
        // Load local copy or handle the fallback logic here
        console.log("Fallback to local copy or handle fallback logic");
      }
    }
  }, []);
  
  

  useEffect(() => {
    if (fetchedUserInfo.userFacebookId && fetchedUserInfo.accessToken) {
      fetchUserInfo();
    }
  }, [fetchedUserInfo.userFacebookId, fetchedUserInfo.accessToken]);

  //initialize facebook login
  const handleFacebookLogin = async () => {
    await FB.getLoginStatus(function (response) {
      if (response.status === "connected") {
        console.log("You are already logged in and authenticated");
        setFetchedUserInfo(prevState => ({
          ...prevState,
          userFacebookId: response.authResponse.userID,
          accessToken: response.authResponse.accessToken,
        }));
      } else {
        promptLogin();
      }
    });
  };

  const promptLogin = async () => {
    await FB.login(
      function (response) {
        console.log(response);
        if (response.authResponse) {
          console.log("Welcome! Fetching your information....");
          console.log(response.authResponse)
          setFetchedUserInfo(prevState => ({
            ...prevState,
            userFacebookId: response.authResponse.userID,
            accessToken: response.authResponse.accessToken,
          }));
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      {
        scope:
          "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,pages_messaging,pages_manage_metadata",
      }
    );
  };

  const fetchUserInfo = async () => {
    console.log(fetchedUserInfo.userFacebookId)
    if (fetchedUserInfo.userFacebookId && fetchedUserInfo.accessToken) {
      try {
        const response = await axios.post(
          `${BASE_URL}userFacebook/register`,
          {
            userFacebookId: fetchedUserInfo.userFacebookId,
            accessToken: fetchedUserInfo.accessToken,
          },
          {
            headers: {
              authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        console.log(response.data);
        if (response.data.message === "UserFacebook registered successfully.") {
          navigate("/pages");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

    console.log(fetchedUserInfo);
  return (
    <section className="integrationSec">
      <p>Facebook Integration Page</p>

      <button onClick={handleFacebookLogin} className="button">
        Connect to Facebook
      </button>
    </section>
  );
};

export default Integration;
