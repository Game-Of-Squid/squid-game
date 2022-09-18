import React from "react";
import SquareOutlinedIcon from "@mui/icons-material/SquareOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import ChangeHistoryOutlinedIcon from "@mui/icons-material/ChangeHistoryOutlined";

import "./eye.css";
import { useNavigate } from "react-router";

const logo = require("../assets/images/squidlogo.png");

const StartPage: React.FC = () => {
  const navigate = useNavigate();

  //   if ("serial" in navigator) {
  //     console.log(navigator.serial)
  //     // The Web Serial API is supported.
  //   }

  const handleClick = (e: any) => {
    e.preventDefault();

    navigate("/game");
  };
  return (
    <div className="rows">
      <div className="start-page">
        <div className="icon-wrapper">
          <CircleOutlinedIcon className="sg-icons pinkcol" />
          <ChangeHistoryOutlinedIcon className="sg-icons" />
          <SquareOutlinedIcon className="sg-icons pinkcol" />
        </div>

        <img src={logo} className="logo-image" alt="Game Of Squid" />

        <p>The Calamari Contest of Fun with Guns! Can you make it to the end? </p>

        <div id="button-container" style={{ justifyContent: "left", gap: "2%" }}>
          <button onClick={handleClick} id="enter-button">
            Enter the Game
          </button>
          <button onClick={handleClick} id="enter-button">
            How to Play
          </button>
        </div>
      </div>

      <div className="eyeballs">
        <div className="wrap">
          <div className="eye up"></div>
          <div className="eye double-blink"></div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
